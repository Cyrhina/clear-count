import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
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
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
export const lines = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines.url(args, options),
    method: 'get',
})

lines.definition = {
    methods: ["get","head"],
    url: '/api/v1/payroll/{period}/lines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
lines.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return lines.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
lines.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
lines.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lines.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
    const linesForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lines.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
        linesForm.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
        linesForm.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lines.form = linesForm
const payroll = {
    index: Object.assign(index, index),
lines: Object.assign(lines, lines),
}

export default payroll