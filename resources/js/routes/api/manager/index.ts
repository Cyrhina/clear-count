import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/api/manager/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
const manager = {
    dashboard: Object.assign(dashboard, dashboard),
}

export default manager