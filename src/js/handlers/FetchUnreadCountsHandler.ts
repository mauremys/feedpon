import Authenticator from '../services/feedly/Authenticator'
import Gateway from '../services/feedly/Gateway'
import { AnyEvent, IActionHandler } from '../shared/interfaces'
import { FetchUnreadCounts } from '../constants/actionTypes'
import { IUnreadCountRepository } from '../services/feedly/interfaces'
import { Inject } from '../shared/di/annotations'
import { UnreadCountsReceived } from '../constants/eventTypes'

@Inject
export default class FetchUnreadCountsHandler implements IActionHandler<FetchUnreadCounts> {
    constructor(private authenticator: Authenticator,
                private gateway: Gateway,
                private unreadCountRepository: IUnreadCountRepository) {
    }

    async handle(action: FetchUnreadCounts, dispatch: (event: AnyEvent) => void): Promise<void> {
        const { access_token } = await this.authenticator.getCredential()
        const { unreadcounts } = await this.gateway.allUnreadCounts(access_token, action.payload)

        await this.unreadCountRepository.putAll(unreadcounts)

        dispatch({
            eventType: UnreadCountsReceived,
            unreadCounts: unreadcounts
        } as UnreadCountsReceived)
    }
}