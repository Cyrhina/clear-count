import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/overtime-rates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:132
 * @route '/api/payroll-settings/overtime-rates'
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
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/overtime-rates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:153
 * @route '/api/payroll-settings/overtime-rates'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
export const update = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/overtime-rates/{overtimeRate}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
update.url = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtimeRate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { overtimeRate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    overtimeRate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        overtimeRate: typeof args.overtimeRate === 'object'
                ? args.overtimeRate.id
                : args.overtimeRate,
                }

    return update.definition.url
            .replace('{overtimeRate}', parsedArgs.overtimeRate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
update.put = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
    const updateForm = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/PayrollSettingsController.php:141
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
        updateForm.put = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
export const destroy = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/overtime-rates/{overtimeRate}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
destroy.url = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtimeRate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { overtimeRate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    overtimeRate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        overtimeRate: typeof args.overtimeRate === 'object'
                ? args.overtimeRate.id
                : args.overtimeRate,
                }

    return destroy.definition.url
            .replace('{overtimeRate}', parsedArgs.overtimeRate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
destroy.delete = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
    const destroyForm = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/PayrollSettingsController.php:168
 * @route '/api/payroll-settings/overtime-rates/{overtimeRate}'
 */
        destroyForm.delete = (args: { overtimeRate: number | { id: number } } | [overtimeRate: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const overtimeRates = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default overtimeRates