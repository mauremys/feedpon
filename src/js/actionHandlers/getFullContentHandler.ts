/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />
/// <reference path="../typings/iconv-lite.d.ts" />
/// <reference path="../typings/whatwg-fetch.d.ts" />

import htmlParser from '../utils/htmlParser'
import iconv from 'iconv-lite'
import { FullContentReceived } from '../constants/eventTypes'
import { GetFullContent } from '../constants/actionTypes'
import { IActionHandler } from './interfaces'
import { IContentFinder } from '../services/contentFinder/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IHttpClient } from '../services/http/interfaces'
import { Inject } from '../di/annotations'

const CHARSET_REGEXP = new RegExp('charset=([^()<>@,;:\\"/[\\]?.=\\s]*)', 'i')
const UTF8_REGEXP = new RegExp('utf-?8', 'i')

async function decodeAsString(response: Response): Promise<string> {
    const contentType = response.headers.get('Content-Type') || ''
    const encodingMatches = contentType.match(CHARSET_REGEXP)

    if (encodingMatches) {
        const encoding = encodingMatches[1]

        // Does not need to convert to UTF-8
        if (!UTF8_REGEXP.test(encoding) && iconv.encodingExists(encoding)) {
            const responseBuffer = await response.arrayBuffer()
            return iconv.decode(new Buffer(new Uint8Array(responseBuffer)), encoding)
        }
    }

    return await response.text()
}

@Inject
export default class GetFullContentHandler implements IActionHandler<GetFullContent, void> {
    constructor(private contentFinder: IContentFinder,
                private httpClient: IHttpClient) {
    }

    async handle(action: GetFullContent, eventDispatcher: IEventDispatcher): Promise<void> {
        const { url, streamId } = action
        const response = await this.httpClient.send(new Request(url))
        const html = await decodeAsString(response)

        const doc = htmlParser(html)
        const foundContent = await this.contentFinder.find(url, doc)

        // TODO: When full content is not found
        if (foundContent) {
            const { content, nextLink } = foundContent

            eventDispatcher.dispatch<FullContentReceived>({
                eventType: FullContentReceived,
                streamId,
                content: content.outerHTML,
                nextLink: nextLink ? nextLink.getAttribute('href') : null
            })
        }
    }
}
