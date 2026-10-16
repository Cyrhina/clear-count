import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
export const payrollLines = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollLines.url(options),
    method: 'get',
})

payrollLines.definition = {
    methods: ["get","head"],
    url: '/api/reports/payroll-lines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
payrollLines.url = (options?: RouteQueryOptions) => {
    return payrollLines.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
payrollLines.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payrollLines.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
payrollLines.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payrollLines.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
    const payrollLinesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payrollLines.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
        payrollLinesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollLines.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ReportController::payrollLines
 * @see app/Http/Controllers/ReportController.php:16
 * @route '/api/reports/payroll-lines'
 */
        payrollLinesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payrollLines.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payrollLines.form = payrollLinesForm
const ReportController = { payrollLines }

export default ReportController