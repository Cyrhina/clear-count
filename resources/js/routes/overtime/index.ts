import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/overtime',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OvertimeController::index
 * @see app/Http/Controllers/OvertimeController.php:19
 * @route '/api/overtime'
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
* @see \App\Http\Controllers\OvertimeController::store
 * @see app/Http/Controllers/OvertimeController.php:36
 * @route '/api/overtime'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/overtime',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OvertimeController::store
 * @see app/Http/Controllers/OvertimeController.php:36
 * @route '/api/overtime'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OvertimeController::store
 * @see app/Http/Controllers/OvertimeController.php:36
 * @route '/api/overtime'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\OvertimeController::store
 * @see app/Http/Controllers/OvertimeController.php:36
 * @route '/api/overtime'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OvertimeController::store
 * @see app/Http/Controllers/OvertimeController.php:36
 * @route '/api/overtime'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
export const rates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rates.url(options),
    method: 'get',
})

rates.definition = {
    methods: ["get","head"],
    url: '/api/overtime/rates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
rates.url = (options?: RouteQueryOptions) => {
    return rates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
rates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: rates.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
rates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: rates.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
    const ratesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: rates.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
        ratesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: rates.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OvertimeController::rates
 * @see app/Http/Controllers/OvertimeController.php:66
 * @route '/api/overtime/rates'
 */
        ratesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: rates.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    rates.form = ratesForm
/**
* @see \App\Http\Controllers\OvertimeController::destroy
 * @see app/Http/Controllers/OvertimeController.php:74
 * @route '/api/overtime/{overtime}'
 */
export const destroy = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/overtime/{overtime}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\OvertimeController::destroy
 * @see app/Http/Controllers/OvertimeController.php:74
 * @route '/api/overtime/{overtime}'
 */
destroy.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { overtime: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    overtime: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        overtime: typeof args.overtime === 'object'
                ? args.overtime.id
                : args.overtime,
                }

    return destroy.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OvertimeController::destroy
 * @see app/Http/Controllers/OvertimeController.php:74
 * @route '/api/overtime/{overtime}'
 */
destroy.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\OvertimeController::destroy
 * @see app/Http/Controllers/OvertimeController.php:74
 * @route '/api/overtime/{overtime}'
 */
    const destroyForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OvertimeController::destroy
 * @see app/Http/Controllers/OvertimeController.php:74
 * @route '/api/overtime/{overtime}'
 */
        destroyForm.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\OvertimeController::decide
 * @see app/Http/Controllers/OvertimeController.php:85
 * @route '/api/overtime/decide'
 */
export const decide = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/overtime/decide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OvertimeController::decide
 * @see app/Http/Controllers/OvertimeController.php:85
 * @route '/api/overtime/decide'
 */
decide.url = (options?: RouteQueryOptions) => {
    return decide.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OvertimeController::decide
 * @see app/Http/Controllers/OvertimeController.php:85
 * @route '/api/overtime/decide'
 */
decide.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\OvertimeController::decide
 * @see app/Http/Controllers/OvertimeController.php:85
 * @route '/api/overtime/decide'
 */
    const decideForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\OvertimeController::decide
 * @see app/Http/Controllers/OvertimeController.php:85
 * @route '/api/overtime/decide'
 */
        decideForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(options),
            method: 'post',
        })
    
    decide.form = decideForm
const overtime = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
rates: Object.assign(rates, rates),
destroy: Object.assign(destroy, destroy),
decide: Object.assign(decide, decide),
}

export default overtime