import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/compensation-types',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CompensationTypeController::index
 * @see app/Http/Controllers/CompensationTypeController.php:20
 * @route '/api/payroll-settings/compensation-types'
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
* @see \App\Http\Controllers\CompensationTypeController::store
 * @see app/Http/Controllers/CompensationTypeController.php:27
 * @route '/api/payroll-settings/compensation-types'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/compensation-types',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CompensationTypeController::store
 * @see app/Http/Controllers/CompensationTypeController.php:27
 * @route '/api/payroll-settings/compensation-types'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompensationTypeController::store
 * @see app/Http/Controllers/CompensationTypeController.php:27
 * @route '/api/payroll-settings/compensation-types'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CompensationTypeController::store
 * @see app/Http/Controllers/CompensationTypeController.php:27
 * @route '/api/payroll-settings/compensation-types'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompensationTypeController::store
 * @see app/Http/Controllers/CompensationTypeController.php:27
 * @route '/api/payroll-settings/compensation-types'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CompensationTypeController::update
 * @see app/Http/Controllers/CompensationTypeController.php:35
 * @route '/api/payroll-settings/compensation-types/{compensationType}'
 */
export const update = (args: { compensationType: number | { id: number } } | [compensationType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/compensation-types/{compensationType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\CompensationTypeController::update
 * @see app/Http/Controllers/CompensationTypeController.php:35
 * @route '/api/payroll-settings/compensation-types/{compensationType}'
 */
update.url = (args: { compensationType: number | { id: number } } | [compensationType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { compensationType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { compensationType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    compensationType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        compensationType: typeof args.compensationType === 'object'
                ? args.compensationType.id
                : args.compensationType,
                }

    return update.definition.url
            .replace('{compensationType}', parsedArgs.compensationType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompensationTypeController::update
 * @see app/Http/Controllers/CompensationTypeController.php:35
 * @route '/api/payroll-settings/compensation-types/{compensationType}'
 */
update.put = (args: { compensationType: number | { id: number } } | [compensationType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\CompensationTypeController::update
 * @see app/Http/Controllers/CompensationTypeController.php:35
 * @route '/api/payroll-settings/compensation-types/{compensationType}'
 */
    const updateForm = (args: { compensationType: number | { id: number } } | [compensationType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompensationTypeController::update
 * @see app/Http/Controllers/CompensationTypeController.php:35
 * @route '/api/payroll-settings/compensation-types/{compensationType}'
 */
        updateForm.put = (args: { compensationType: number | { id: number } } | [compensationType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const compensationTypes = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default compensationTypes