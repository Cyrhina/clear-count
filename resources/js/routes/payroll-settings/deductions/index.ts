import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/deductions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:76
 * @route '/api/payroll-settings/deductions'
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
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/deductions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:83
 * @route '/api/payroll-settings/deductions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
export const update = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/deductions/{deductionType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
update.url = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionType: typeof args.deductionType === 'object'
                ? args.deductionType.id
                : args.deductionType,
                }

    return update.definition.url
            .replace('{deductionType}', parsedArgs.deductionType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
update.put = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
    const updateForm = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:91
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
        updateForm.put = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
export const destroy = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/deductions/{deductionType}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
destroy.url = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { deductionType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { deductionType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    deductionType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        deductionType: typeof args.deductionType === 'object'
                ? args.deductionType.id
                : args.deductionType,
                }

    return destroy.definition.url
            .replace('{deductionType}', parsedArgs.deductionType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
destroy.delete = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
    const destroyForm = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:99
 * @route '/api/payroll-settings/deductions/{deductionType}'
 */
        destroyForm.delete = (args: { deductionType: number | { id: number } } | [deductionType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const deductions = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default deductions