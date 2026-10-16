import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/integrations/api-keys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ApiKeyController::index
 * @see app/Http/Controllers/ApiKeyController.php:26
 * @route '/api/integrations/api-keys'
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
* @see \App\Http\Controllers\ApiKeyController::store
 * @see app/Http/Controllers/ApiKeyController.php:31
 * @route '/api/integrations/api-keys'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/integrations/api-keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApiKeyController::store
 * @see app/Http/Controllers/ApiKeyController.php:31
 * @route '/api/integrations/api-keys'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApiKeyController::store
 * @see app/Http/Controllers/ApiKeyController.php:31
 * @route '/api/integrations/api-keys'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ApiKeyController::store
 * @see app/Http/Controllers/ApiKeyController.php:31
 * @route '/api/integrations/api-keys'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApiKeyController::store
 * @see app/Http/Controllers/ApiKeyController.php:31
 * @route '/api/integrations/api-keys'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ApiKeyController::destroy
 * @see app/Http/Controllers/ApiKeyController.php:53
 * @route '/api/integrations/api-keys/{key}'
 */
export const destroy = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/integrations/api-keys/{key}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ApiKeyController::destroy
 * @see app/Http/Controllers/ApiKeyController.php:53
 * @route '/api/integrations/api-keys/{key}'
 */
destroy.url = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { key: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    key: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        key: args.key,
                }

    return destroy.definition.url
            .replace('{key}', parsedArgs.key.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApiKeyController::destroy
 * @see app/Http/Controllers/ApiKeyController.php:53
 * @route '/api/integrations/api-keys/{key}'
 */
destroy.delete = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ApiKeyController::destroy
 * @see app/Http/Controllers/ApiKeyController.php:53
 * @route '/api/integrations/api-keys/{key}'
 */
    const destroyForm = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ApiKeyController::destroy
 * @see app/Http/Controllers/ApiKeyController.php:53
 * @route '/api/integrations/api-keys/{key}'
 */
        destroyForm.delete = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ApiKeyController = { index, store, destroy }

export default ApiKeyController