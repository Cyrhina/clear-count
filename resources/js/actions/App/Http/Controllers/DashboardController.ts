import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
export const overview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})

overview.definition = {
    methods: ["get","head"],
    url: '/api/dashboard/overview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
overview.url = (options?: RouteQueryOptions) => {
    return overview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
overview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
overview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overview.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
    const overviewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: overview.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
        overviewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overview.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::overview
 * @see app/Http/Controllers/DashboardController.php:31
 * @route '/api/dashboard/overview'
 */
        overviewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: overview.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    overview.form = overviewForm
/**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
export const payroll = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payroll.url(options),
    method: 'get',
})

payroll.definition = {
    methods: ["get","head"],
    url: '/api/dashboard/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
payroll.url = (options?: RouteQueryOptions) => {
    return payroll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
payroll.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payroll.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
payroll.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payroll.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
    const payrollForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payroll.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
        payrollForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payroll.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::payroll
 * @see app/Http/Controllers/DashboardController.php:63
 * @route '/api/dashboard/payroll'
 */
        payrollForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payroll.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payroll.form = payrollForm
/**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
export const workforce = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workforce.url(options),
    method: 'get',
})

workforce.definition = {
    methods: ["get","head"],
    url: '/api/dashboard/workforce',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
workforce.url = (options?: RouteQueryOptions) => {
    return workforce.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
workforce.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workforce.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
workforce.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: workforce.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
    const workforceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: workforce.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
        workforceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workforce.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::workforce
 * @see app/Http/Controllers/DashboardController.php:93
 * @route '/api/dashboard/workforce'
 */
        workforceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workforce.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    workforce.form = workforceForm
const DashboardController = { overview, payroll, workforce }

export default DashboardController