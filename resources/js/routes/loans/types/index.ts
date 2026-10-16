import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/loans/types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:19
 * @route '/api/loans/types'
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
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/loans/types',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:26
 * @route '/api/loans/types'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
export const update = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/loans/types/{loanType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
update.url = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loanType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loanType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loanType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loanType: typeof args.loanType === 'object'
                ? args.loanType.id
                : args.loanType,
                }

    return update.definition.url
            .replace('{loanType}', parsedArgs.loanType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
update.put = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
    const updateForm = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:44
 * @route '/api/loans/types/{loanType}'
 */
        updateForm.put = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\LoanController::destroy
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
export const destroy = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/loans/types/{loanType}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LoanController::destroy
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
destroy.url = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loanType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loanType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loanType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loanType: typeof args.loanType === 'object'
                ? args.loanType.id
                : args.loanType,
                }

    return destroy.definition.url
            .replace('{loanType}', parsedArgs.loanType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::destroy
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
destroy.delete = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LoanController::destroy
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
    const destroyForm = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::destroy
 * @see app/Http/Controllers/LoanController.php:54
 * @route '/api/loans/types/{loanType}'
 */
        destroyForm.delete = (args: { loanType: number | { id: number } } | [loanType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const types = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default types