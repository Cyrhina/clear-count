import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
export const index = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/bonuses/{bonus}/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
index.url = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { bonus: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { bonus: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    bonus: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonus: typeof args.bonus === 'object'
                ? args.bonus.id
                : args.bonus,
                }

    return index.definition.url
            .replace('{bonus}', parsedArgs.bonus.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
index.get = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
index.head = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
    const indexForm = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
        indexForm.get = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BonusPayslipController::index
 * @see app/Http/Controllers/BonusPayslipController.php:15
 * @route '/api/bonuses/{bonus}/payslips'
 */
        indexForm.head = (args: { bonus: number | { id: number } } | [bonus: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
export const pdf = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})

pdf.definition = {
    methods: ["get","head"],
    url: '/api/bonuses/{bonus}/payslips/{employee}/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
pdf.url = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    bonus: args[0],
                    employee: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        bonus: typeof args.bonus === 'object'
                ? args.bonus.id
                : args.bonus,
                                employee: typeof args.employee === 'object'
                ? args.employee.id
                : args.employee,
                }

    return pdf.definition.url
            .replace('{bonus}', parsedArgs.bonus.toString())
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
pdf.get = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
pdf.head = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
    const pdfForm = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
        pdfForm.get = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BonusPayslipController::pdf
 * @see app/Http/Controllers/BonusPayslipController.php:20
 * @route '/api/bonuses/{bonus}/payslips/{employee}/pdf'
 */
        pdfForm.head = (args: { bonus: number | { id: number }, employee: number | { id: number } } | [bonus: number | { id: number }, employee: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pdf.form = pdfForm
const BonusPayslipController = { index, pdf }

export default BonusPayslipController