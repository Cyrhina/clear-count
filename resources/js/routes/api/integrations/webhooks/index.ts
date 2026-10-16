import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/integrations/webhooks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WebhookController::index
 * @see app/Http/Controllers/WebhookController.php:18
 * @route '/api/integrations/webhooks'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\WebhookController::store
 * @see app/Http/Controllers/WebhookController.php:29
 * @route '/api/integrations/webhooks'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/integrations/webhooks',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WebhookController::store
 * @see app/Http/Controllers/WebhookController.php:29
 * @route '/api/integrations/webhooks'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WebhookController::store
 * @see app/Http/Controllers/WebhookController.php:29
 * @route '/api/integrations/webhooks'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WebhookController::store
 * @see app/Http/Controllers/WebhookController.php:29
 * @route '/api/integrations/webhooks'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WebhookController::store
 * @see app/Http/Controllers/WebhookController.php:29
 * @route '/api/integrations/webhooks'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\WebhookController::update
 * @see app/Http/Controllers/WebhookController.php:47
 * @route '/api/integrations/webhooks/{endpoint}'
 */
export const update = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/integrations/webhooks/{endpoint}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\WebhookController::update
 * @see app/Http/Controllers/WebhookController.php:47
 * @route '/api/integrations/webhooks/{endpoint}'
 */
update.url = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { endpoint: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { endpoint: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    endpoint: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        endpoint: typeof args.endpoint === 'object'
                ? args.endpoint.id
                : args.endpoint,
                }

    return update.definition.url
            .replace('{endpoint}', parsedArgs.endpoint.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WebhookController::update
 * @see app/Http/Controllers/WebhookController.php:47
 * @route '/api/integrations/webhooks/{endpoint}'
 */
update.patch = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\WebhookController::update
 * @see app/Http/Controllers/WebhookController.php:47
 * @route '/api/integrations/webhooks/{endpoint}'
 */
    const updateForm = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WebhookController::update
 * @see app/Http/Controllers/WebhookController.php:47
 * @route '/api/integrations/webhooks/{endpoint}'
 */
        updateForm.patch = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\WebhookController::destroy
 * @see app/Http/Controllers/WebhookController.php:59
 * @route '/api/integrations/webhooks/{endpoint}'
 */
export const destroy = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/integrations/webhooks/{endpoint}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WebhookController::destroy
 * @see app/Http/Controllers/WebhookController.php:59
 * @route '/api/integrations/webhooks/{endpoint}'
 */
destroy.url = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { endpoint: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { endpoint: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    endpoint: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        endpoint: typeof args.endpoint === 'object'
                ? args.endpoint.id
                : args.endpoint,
                }

    return destroy.definition.url
            .replace('{endpoint}', parsedArgs.endpoint.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WebhookController::destroy
 * @see app/Http/Controllers/WebhookController.php:59
 * @route '/api/integrations/webhooks/{endpoint}'
 */
destroy.delete = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\WebhookController::destroy
 * @see app/Http/Controllers/WebhookController.php:59
 * @route '/api/integrations/webhooks/{endpoint}'
 */
    const destroyForm = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WebhookController::destroy
 * @see app/Http/Controllers/WebhookController.php:59
 * @route '/api/integrations/webhooks/{endpoint}'
 */
        destroyForm.delete = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
export const deliveries = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveries.url(args, options),
    method: 'get',
})

deliveries.definition = {
    methods: ["get","head"],
    url: '/api/integrations/webhooks/{endpoint}/deliveries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
deliveries.url = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { endpoint: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { endpoint: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    endpoint: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        endpoint: typeof args.endpoint === 'object'
                ? args.endpoint.id
                : args.endpoint,
                }

    return deliveries.definition.url
            .replace('{endpoint}', parsedArgs.endpoint.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
deliveries.get = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveries.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
deliveries.head = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deliveries.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
    const deliveriesForm = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: deliveries.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
        deliveriesForm.get = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deliveries.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\WebhookController::deliveries
 * @see app/Http/Controllers/WebhookController.php:67
 * @route '/api/integrations/webhooks/{endpoint}/deliveries'
 */
        deliveriesForm.head = (args: { endpoint: number | { id: number } } | [endpoint: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deliveries.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    deliveries.form = deliveriesForm
/**
* @see \App\Http\Controllers\WebhookController::retry
 * @see app/Http/Controllers/WebhookController.php:78
 * @route '/api/integrations/webhook-deliveries/{delivery}/retry'
 */
export const retry = (args: { delivery: number | { id: number } } | [delivery: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

retry.definition = {
    methods: ["post"],
    url: '/api/integrations/webhook-deliveries/{delivery}/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WebhookController::retry
 * @see app/Http/Controllers/WebhookController.php:78
 * @route '/api/integrations/webhook-deliveries/{delivery}/retry'
 */
retry.url = (args: { delivery: number | { id: number } } | [delivery: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { delivery: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { delivery: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    delivery: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        delivery: typeof args.delivery === 'object'
                ? args.delivery.id
                : args.delivery,
                }

    return retry.definition.url
            .replace('{delivery}', parsedArgs.delivery.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WebhookController::retry
 * @see app/Http/Controllers/WebhookController.php:78
 * @route '/api/integrations/webhook-deliveries/{delivery}/retry'
 */
retry.post = (args: { delivery: number | { id: number } } | [delivery: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WebhookController::retry
 * @see app/Http/Controllers/WebhookController.php:78
 * @route '/api/integrations/webhook-deliveries/{delivery}/retry'
 */
    const retryForm = (args: { delivery: number | { id: number } } | [delivery: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: retry.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WebhookController::retry
 * @see app/Http/Controllers/WebhookController.php:78
 * @route '/api/integrations/webhook-deliveries/{delivery}/retry'
 */
        retryForm.post = (args: { delivery: number | { id: number } } | [delivery: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: retry.url(args, options),
            method: 'post',
        })
    
    retry.form = retryForm
const webhooks = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
deliveries: Object.assign(deliveries, deliveries),
retry: Object.assign(retry, retry),
}

export default webhooks