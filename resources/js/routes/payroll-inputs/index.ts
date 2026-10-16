import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
export const show = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/payroll-inputs/{period}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
show.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return show.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
show.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
show.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
    const showForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
        showForm.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollInputsController::show
 * @see app/Http/Controllers/PayrollInputsController.php:26
 * @route '/api/payroll-inputs/{period}'
 */
        showForm.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const payrollInputs = {
    show: Object.assign(show, show),
}

export default payrollInputs