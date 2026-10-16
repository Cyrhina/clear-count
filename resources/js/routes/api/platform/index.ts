import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import companies from './companies'
import payments from './payments'
/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/api/platform/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PlatformController::dashboard
 * @see app/Http/Controllers/PlatformController.php:24
 * @route '/api/platform/dashboard'
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
const platform = {
    dashboard: Object.assign(dashboard, dashboard),
companies: Object.assign(companies, companies),
payments: Object.assign(payments, payments),
}

export default platform