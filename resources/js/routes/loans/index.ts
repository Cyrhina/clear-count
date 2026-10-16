import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import types from './types'
/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/loans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LoanController::index
 * @see app/Http/Controllers/LoanController.php:88
 * @route '/api/loans'
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
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/loans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::store
 * @see app/Http/Controllers/LoanController.php:93
 * @route '/api/loans'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LoanController::bulk
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
export const bulk = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulk.url(options),
    method: 'post',
})

bulk.definition = {
    methods: ["post"],
    url: '/api/loans/bulk',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::bulk
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
bulk.url = (options?: RouteQueryOptions) => {
    return bulk.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::bulk
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
bulk.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulk.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::bulk
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
    const bulkForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulk.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::bulk
 * @see app/Http/Controllers/LoanController.php:112
 * @route '/api/loans/bulk'
 */
        bulkForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulk.url(options),
            method: 'post',
        })
    
    bulk.form = bulkForm
/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
export const update = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/loans/{loan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
update.url = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loan: typeof args.loan === 'object'
                ? args.loan.id
                : args.loan,
                }

    return update.definition.url
            .replace('{loan}', parsedArgs.loan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
update.put = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\LoanController::update
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
    const updateForm = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/LoanController.php:147
 * @route '/api/loans/{loan}'
 */
        updateForm.put = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\LoanController::status
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
export const status = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/api/loans/{loan}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LoanController::status
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
status.url = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { loan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { loan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    loan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        loan: typeof args.loan === 'object'
                ? args.loan.id
                : args.loan,
                }

    return status.definition.url
            .replace('{loan}', parsedArgs.loan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LoanController::status
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
status.post = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LoanController::status
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
    const statusForm = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LoanController::status
 * @see app/Http/Controllers/LoanController.php:166
 * @route '/api/loans/{loan}/status'
 */
        statusForm.post = (args: { loan: number | { id: number } } | [loan: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, options),
            method: 'post',
        })
    
    status.form = statusForm
const loans = {
    index: Object.assign(index, index),
types: Object.assign(types, types),
store: Object.assign(store, store),
bulk: Object.assign(bulk, bulk),
update: Object.assign(update, update),
status: Object.assign(status, status),
}

export default loans