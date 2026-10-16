import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payslips',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayslipController::index
 * @see app/Http/Controllers/PayslipController.php:18
 * @route '/api/payslips'
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
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
 */
export const show = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/payslips/{line}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
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
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
 */
show.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
 */
show.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
 */
    const showForm = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
 */
        showForm.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayslipController::show
 * @see app/Http/Controllers/PayslipController.php:26
 * @route '/api/payslips/{line}'
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
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
export const pdf = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})

pdf.definition = {
    methods: ["get","head"],
    url: '/api/payslips/{line}/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
pdf.url = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return pdf.definition.url
            .replace('{line}', parsedArgs.line.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
pdf.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
pdf.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
    const pdfForm = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
        pdfForm.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayslipController::pdf
 * @see app/Http/Controllers/PayslipController.php:33
 * @route '/api/payslips/{line}/pdf'
 */
        pdfForm.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pdf.form = pdfForm
const PayslipController = { index, show, pdf }

export default PayslipController