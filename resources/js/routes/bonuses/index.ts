import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/bonuses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:76
 * @route '/bonuses'
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
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
export const payslip = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslip.url(args, options),
    method: 'get',
})

payslip.definition = {
    methods: ["get","head"],
    url: '/bonuses/{bonusId}/payslips/{employeeId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
payslip.url = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    bonusId: args[0],
                    employeeId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonusId: args.bonusId,
                                employeeId: args.employeeId,
                }

    return payslip.definition.url
            .replace('{bonusId}', parsedArgs.bonusId.toString())
            .replace('{employeeId}', parsedArgs.employeeId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
payslip.get = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payslip.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
payslip.head = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payslip.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
    const payslipForm = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payslip.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
        payslipForm.get = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslip.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::payslip
 * @see app/Http/Controllers/OpsController.php:81
 * @route '/bonuses/{bonusId}/payslips/{employeeId}'
 */
        payslipForm.head = (args: { bonusId: string | number, employeeId: string | number } | [bonusId: string | number, employeeId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payslip.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payslip.form = payslipForm
const bonuses = {
    index: Object.assign(index, index),
payslip: Object.assign(payslip, payslip),
}

export default bonuses