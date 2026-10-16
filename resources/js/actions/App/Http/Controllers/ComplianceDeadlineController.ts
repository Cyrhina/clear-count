import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/compliance-deadlines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ComplianceDeadlineController::index
 * @see app/Http/Controllers/ComplianceDeadlineController.php:20
 * @route '/api/payroll-settings/compliance-deadlines'
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
* @see \App\Http\Controllers\ComplianceDeadlineController::store
 * @see app/Http/Controllers/ComplianceDeadlineController.php:27
 * @route '/api/payroll-settings/compliance-deadlines'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/compliance-deadlines',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::store
 * @see app/Http/Controllers/ComplianceDeadlineController.php:27
 * @route '/api/payroll-settings/compliance-deadlines'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::store
 * @see app/Http/Controllers/ComplianceDeadlineController.php:27
 * @route '/api/payroll-settings/compliance-deadlines'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ComplianceDeadlineController::store
 * @see app/Http/Controllers/ComplianceDeadlineController.php:27
 * @route '/api/payroll-settings/compliance-deadlines'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ComplianceDeadlineController::store
 * @see app/Http/Controllers/ComplianceDeadlineController.php:27
 * @route '/api/payroll-settings/compliance-deadlines'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ComplianceDeadlineController::update
 * @see app/Http/Controllers/ComplianceDeadlineController.php:35
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
export const update = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/compliance-deadlines/{complianceDeadline}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::update
 * @see app/Http/Controllers/ComplianceDeadlineController.php:35
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
update.url = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { complianceDeadline: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { complianceDeadline: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    complianceDeadline: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        complianceDeadline: typeof args.complianceDeadline === 'object'
                ? args.complianceDeadline.id
                : args.complianceDeadline,
                }

    return update.definition.url
            .replace('{complianceDeadline}', parsedArgs.complianceDeadline.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::update
 * @see app/Http/Controllers/ComplianceDeadlineController.php:35
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
update.put = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ComplianceDeadlineController::update
 * @see app/Http/Controllers/ComplianceDeadlineController.php:35
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
    const updateForm = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ComplianceDeadlineController::update
 * @see app/Http/Controllers/ComplianceDeadlineController.php:35
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
        updateForm.put = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ComplianceDeadlineController::destroy
 * @see app/Http/Controllers/ComplianceDeadlineController.php:43
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
export const destroy = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/compliance-deadlines/{complianceDeadline}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::destroy
 * @see app/Http/Controllers/ComplianceDeadlineController.php:43
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
destroy.url = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { complianceDeadline: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { complianceDeadline: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    complianceDeadline: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        complianceDeadline: typeof args.complianceDeadline === 'object'
                ? args.complianceDeadline.id
                : args.complianceDeadline,
                }

    return destroy.definition.url
            .replace('{complianceDeadline}', parsedArgs.complianceDeadline.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ComplianceDeadlineController::destroy
 * @see app/Http/Controllers/ComplianceDeadlineController.php:43
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
destroy.delete = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ComplianceDeadlineController::destroy
 * @see app/Http/Controllers/ComplianceDeadlineController.php:43
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
    const destroyForm = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ComplianceDeadlineController::destroy
 * @see app/Http/Controllers/ComplianceDeadlineController.php:43
 * @route '/api/payroll-settings/compliance-deadlines/{complianceDeadline}'
 */
        destroyForm.delete = (args: { complianceDeadline: number | { id: number } } | [complianceDeadline: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ComplianceDeadlineController = { index, store, update, destroy }

export default ComplianceDeadlineController