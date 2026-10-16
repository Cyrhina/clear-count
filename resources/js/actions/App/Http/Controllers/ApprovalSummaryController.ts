import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
const ApprovalSummaryController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ApprovalSummaryController.url(options),
    method: 'get',
})

ApprovalSummaryController.definition = {
    methods: ["get","head"],
    url: '/api/approvals/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
ApprovalSummaryController.url = (options?: RouteQueryOptions) => {
    return ApprovalSummaryController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
ApprovalSummaryController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ApprovalSummaryController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
ApprovalSummaryController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ApprovalSummaryController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
    const ApprovalSummaryControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: ApprovalSummaryController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
        ApprovalSummaryControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ApprovalSummaryController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ApprovalSummaryController::__invoke
 * @see app/Http/Controllers/ApprovalSummaryController.php:25
 * @route '/api/approvals/summary'
 */
        ApprovalSummaryControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ApprovalSummaryController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    ApprovalSummaryController.form = ApprovalSummaryControllerForm
export default ApprovalSummaryController