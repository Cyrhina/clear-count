import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/thirteenth-month-pay',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:86
 * @route '/thirteenth-month-pay'
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
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
export const payslip = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslip.url(args, options),
    method: 'get',
})

payslip.definition = {
    methods: ["get","head"],
    url: '/thirteenth-month-pay/{runId}/payslips/{employeeId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
payslip.url = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    runId: args[0],
                    employeeId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        runId: args.runId,
                                employeeId: args.employeeId,
                }

    return payslip.definition.url
            .replace('{runId}', parsedArgs.runId.toString())
            .replace('{employeeId}', parsedArgs.employeeId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
payslip.get = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslip.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
payslip.head = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payslip.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
    const payslipForm = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payslip.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
        payslipForm.get = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslip.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:91
 * @route '/thirteenth-month-pay/{runId}/payslips/{employeeId}'
 */
        payslipForm.head = (args: { runId: string | number, employeeId: string | number } | [runId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslip.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payslip.form = payslipForm
const thirteenth = {
    index: Object.assign(index, index),
payslip: Object.assign(payslip, payslip),
}

export default thirteenth