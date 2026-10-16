import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
export const show = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/payroll/lines/{line}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
show.url = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { line: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { line: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    line: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        line: typeof args.line === 'object'
                ? args.line.id
                : args.line,
                }

    return show.definition.url
            .replace('{line}', parsedArgs.line.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
show.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
show.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
    const showForm = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
        showForm.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::show
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
        showForm.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
export const index = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll/{period}/lines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
index.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
index.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
index.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
    const indexForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
        indexForm.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
        indexForm.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
const lines = {
    show: Object.assign(show, show),
index: Object.assign(index, index),
}

export default lines