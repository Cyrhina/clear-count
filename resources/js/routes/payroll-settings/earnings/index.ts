import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/earnings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:30
 * @route '/api/payroll-settings/earnings'
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
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/earnings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:37
 * @route '/api/payroll-settings/earnings'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
export const update = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/earnings/{earningType}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
update.url = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { earningType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { earningType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    earningType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        earningType: typeof args.earningType === 'object'
                ? args.earningType.id
                : args.earningType,
                }

    return update.definition.url
            .replace('{earningType}', parsedArgs.earningType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
update.put = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
    const updateForm = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/PayrollSettingsController.php:45
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
        updateForm.put = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
export const destroy = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/earnings/{earningType}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
destroy.url = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { earningType: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { earningType: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    earningType: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        earningType: typeof args.earningType === 'object'
                ? args.earningType.id
                : args.earningType,
                }

    return destroy.definition.url
            .replace('{earningType}', parsedArgs.earningType.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
destroy.delete = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
    const destroyForm = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/PayrollSettingsController.php:53
 * @route '/api/payroll-settings/earnings/{earningType}'
 */
        destroyForm.delete = (args: { earningType: number | { id: number } } | [earningType: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const earnings = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default earnings