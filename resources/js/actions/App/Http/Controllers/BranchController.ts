import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BranchController::index
 * @see app/Http/Controllers/BranchController.php:21
 * @route '/api/branches'
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
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
export const summaries = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summaries.url(options),
    method: 'get',
})

summaries.definition = {
    methods: ["get","head"],
    url: '/api/branches/summaries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
summaries.url = (options?: RouteQueryOptions) => {
    return summaries.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
summaries.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summaries.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
summaries.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summaries.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
    const summariesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: summaries.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
        summariesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summaries.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BranchController::summaries
 * @see app/Http/Controllers/BranchController.php:30
 * @route '/api/branches/summaries'
 */
        summariesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summaries.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    summaries.form = summariesForm
/**
* @see \App\Http\Controllers\BranchController::store
 * @see app/Http/Controllers/BranchController.php:43
 * @route '/api/branches'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/branches',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BranchController::store
 * @see app/Http/Controllers/BranchController.php:43
 * @route '/api/branches'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchController::store
 * @see app/Http/Controllers/BranchController.php:43
 * @route '/api/branches'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BranchController::store
 * @see app/Http/Controllers/BranchController.php:43
 * @route '/api/branches'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchController::store
 * @see app/Http/Controllers/BranchController.php:43
 * @route '/api/branches'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BranchController::update
 * @see app/Http/Controllers/BranchController.php:51
 * @route '/api/branches/{branch}'
 */
export const update = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/branches/{branch}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BranchController::update
 * @see app/Http/Controllers/BranchController.php:51
 * @route '/api/branches/{branch}'
 */
update.url = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { branch: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: typeof args.branch === 'object'
                ? args.branch.id
                : args.branch,
                }

    return update.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchController::update
 * @see app/Http/Controllers/BranchController.php:51
 * @route '/api/branches/{branch}'
 */
update.put = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BranchController::update
 * @see app/Http/Controllers/BranchController.php:51
 * @route '/api/branches/{branch}'
 */
    const updateForm = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchController::update
 * @see app/Http/Controllers/BranchController.php:51
 * @route '/api/branches/{branch}'
 */
        updateForm.put = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\BranchController::destroy
 * @see app/Http/Controllers/BranchController.php:60
 * @route '/api/branches/{branch}'
 */
export const destroy = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/branches/{branch}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BranchController::destroy
 * @see app/Http/Controllers/BranchController.php:60
 * @route '/api/branches/{branch}'
 */
destroy.url = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { branch: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: typeof args.branch === 'object'
                ? args.branch.id
                : args.branch,
                }

    return destroy.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchController::destroy
 * @see app/Http/Controllers/BranchController.php:60
 * @route '/api/branches/{branch}'
 */
destroy.delete = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\BranchController::destroy
 * @see app/Http/Controllers/BranchController.php:60
 * @route '/api/branches/{branch}'
 */
    const destroyForm = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchController::destroy
 * @see app/Http/Controllers/BranchController.php:60
 * @route '/api/branches/{branch}'
 */
        destroyForm.delete = (args: { branch: number | { id: number } } | [branch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const BranchController = { index, summaries, store, update, destroy }

export default BranchController