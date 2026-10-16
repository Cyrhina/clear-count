import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
export const summary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/api/approvals/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
summary.url = (options?: RouteQueryOptions) => {
    return summary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
summary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
summary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
    const summaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: summary.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
        summaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summary.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
        summaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: summary.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    summary.form = summaryForm
const approvals = {
    summary: Object.assign(summary, summary),
}

export default approvals