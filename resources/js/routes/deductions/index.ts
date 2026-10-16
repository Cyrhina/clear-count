import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import plans from './plans'
/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/deductions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DeductionController::index
 * @see app/Http/Controllers/DeductionController.php:71
 * @route '/api/deductions'
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
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/deductions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::store
 * @see app/Http/Controllers/DeductionController.php:76
 * @route '/api/deductions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
export const update = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/deductions/{employeeDeduction}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
update.url = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeDeduction: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employeeDeduction: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employeeDeduction: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employeeDeduction: typeof args.employeeDeduction === 'object'
                ? args.employeeDeduction.id
                : args.employeeDeduction,
                }

    return update.definition.url
            .replace('{employeeDeduction}', parsedArgs.employeeDeduction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
update.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
    const updateForm = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DeductionController::update
 * @see app/Http/Controllers/DeductionController.php:96
 * @route '/api/deductions/{employeeDeduction}'
 */
        updateForm.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const deductions = {
    index: Object.assign(index, index),
plans: Object.assign(plans, plans),
store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default deductions