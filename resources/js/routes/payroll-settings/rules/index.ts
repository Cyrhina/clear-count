import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::show
 * @see app/Http/Controllers/PayrollSettingsController.php:181
 * @route '/api/payroll-settings/rules'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/rules',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:187
 * @route '/api/payroll-settings/rules'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const rules = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
}

export default rules