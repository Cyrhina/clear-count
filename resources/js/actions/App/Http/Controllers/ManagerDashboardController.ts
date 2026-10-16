import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
const ManagerDashboardController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ManagerDashboardController.url(options),
    method: 'get',
})

ManagerDashboardController.definition = {
    methods: ["get","head"],
    url: '/api/manager/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
ManagerDashboardController.url = (options?: RouteQueryOptions) => {
    return ManagerDashboardController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
ManagerDashboardController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ManagerDashboardController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
ManagerDashboardController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ManagerDashboardController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
    const ManagerDashboardControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: ManagerDashboardController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
        ManagerDashboardControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ManagerDashboardController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ManagerDashboardController::__invoke
 * @see app/Http/Controllers/ManagerDashboardController.php:18
 * @route '/api/manager/dashboard'
 */
        ManagerDashboardControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ManagerDashboardController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    ManagerDashboardController.form = ManagerDashboardControllerForm
export default ManagerDashboardController