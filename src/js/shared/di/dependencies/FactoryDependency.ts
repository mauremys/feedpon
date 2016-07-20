import { IDependency, IInjectable, IInjectableFunction, IInstantiable, IScope } from '../interfaces';

export default class FactoryDependency<T> implements IDependency<T>, IInstantiable<T> {
    constructor(private _factory: IInjectableFunction<T>,
                private _dependencies: IDependency<any>[],
                private _scope: IScope<T>) {
        if (typeof _factory !== 'function') {
            throw `"${_factory}" is not a factory function.`;
        }
    }

    getInjectable(): IInjectable<T> {
        return this._factory;
    }

    get(instances: WeakMap<IInjectable<any>, any>): T {
        return this._scope(this, instances);
    }

    instantiate(instances: WeakMap<IInjectable<any>, any>): T {
        const args = this._dependencies.map(dependency => dependency.get(instances));
        return this._factory(...args);
    }
}
