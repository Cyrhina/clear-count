import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/thirteenth-month',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ThirteenthMonthController::index
 * @see app/Http/Controllers/ThirteenthMonthController.php:18
 * @route '/api/thirteenth-month'
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
* @see \App\Http\Controllers\ThirteenthMonthController::preview
 * @see app/Http/Controllers/ThirteenthMonthController.php:29
 * @route '/api/thirteenth-month/preview'
 */
export const preview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/api/thirteenth-month/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ThirteenthMonthController::preview
 * @see app/Http/Controllers/ThirteenthMonthController.php:29
 * @route '/api/thirteenth-month/preview'
 */
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ThirteenthMonthController::preview
 * @see app/Http/Controllers/ThirteenthMonthController.php:29
 * @route '/api/thirteenth-month/preview'
 */
preview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ThirteenthMonthController::preview
 * @see app/Http/Controllers/ThirteenthMonthController.php:29
 * @route '/api/thirteenth-month/preview'
 */
    const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: preview.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ThirteenthMonthController::preview
 * @see app/Http/Controllers/ThirteenthMonthController.php:29
 * @route '/api/thirteenth-month/preview'
 */
        previewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: preview.url(options),
            method: 'post',
        })
    
    preview.form = previewForm
/**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
export const lines = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines.url(args, options),
    method: 'get',
})

lines.definition = {
    methods: ["get","head"],
    url: '/api/thirteenth-month/{run}/lines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
lines.url = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { run: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { run: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    run: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        run: typeof args.run === 'object'
                ? args.run.id
                : args.run,
                }

    return lines.definition.url
            .replace('{run}', parsedArgs.run.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
lines.get = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
lines.head = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lines.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
    const linesForm = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lines.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
        linesForm.get = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ThirteenthMonthController::lines
 * @see app/Http/Controllers/ThirteenthMonthController.php:23
 * @route '/api/thirteenth-month/{run}/lines'
 */
        linesForm.head = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lines.form = linesForm
/**
* @see \App\Http\Controllers\ThirteenthMonthController::generate
 * @see app/Http/Controllers/ThirteenthMonthController.php:38
 * @route '/api/thirteenth-month'
 */
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/thirteenth-month',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ThirteenthMonthController::generate
 * @see app/Http/Controllers/ThirteenthMonthController.php:38
 * @route '/api/thirteenth-month'
 */
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ThirteenthMonthController::generate
 * @see app/Http/Controllers/ThirteenthMonthController.php:38
 * @route '/api/thirteenth-month'
 */
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ThirteenthMonthController::generate
 * @see app/Http/Controllers/ThirteenthMonthController.php:38
 * @route '/api/thirteenth-month'
 */
    const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: generate.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ThirteenthMonthController::generate
 * @see app/Http/Controllers/ThirteenthMonthController.php:38
 * @route '/api/thirteenth-month'
 */
        generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: generate.url(options),
            method: 'post',
        })
    
    generate.form = generateForm
/**
* @see \App\Http\Controllers\ThirteenthMonthController::finalize
 * @see app/Http/Controllers/ThirteenthMonthController.php:47
 * @route '/api/thirteenth-month/{run}/finalize'
 */
export const finalize = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finalize.url(args, options),
    method: 'post',
})

finalize.definition = {
    methods: ["post"],
    url: '/api/thirteenth-month/{run}/finalize',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ThirteenthMonthController::finalize
 * @see app/Http/Controllers/ThirteenthMonthController.php:47
 * @route '/api/thirteenth-month/{run}/finalize'
 */
finalize.url = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { run: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { run: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    run: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        run: typeof args.run === 'object'
                ? args.run.id
                : args.run,
                }

    return finalize.definition.url
            .replace('{run}', parsedArgs.run.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ThirteenthMonthController::finalize
 * @see app/Http/Controllers/ThirteenthMonthController.php:47
 * @route '/api/thirteenth-month/{run}/finalize'
 */
finalize.post = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finalize.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ThirteenthMonthController::finalize
 * @see app/Http/Controllers/ThirteenthMonthController.php:47
 * @route '/api/thirteenth-month/{run}/finalize'
 */
    const finalizeForm = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: finalize.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ThirteenthMonthController::finalize
 * @see app/Http/Controllers/ThirteenthMonthController.php:47
 * @route '/api/thirteenth-month/{run}/finalize'
 */
        finalizeForm.post = (args: { run: number | { id: number } } | [run: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: finalize.url(args, options),
            method: 'post',
        })
    
    finalize.form = finalizeForm
/**
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
 */
export const pdf = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})

pdf.definition = {
    methods: ["get","head"],
    url: '/api/thirteenth-month/lines/{line}/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
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
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
 */
pdf.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
 */
pdf.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
 */
    const pdfForm = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
 */
        pdfForm.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ThirteenthMonthController::pdf
 * @see app/Http/Controllers/ThirteenthMonthController.php:55
 * @route '/api/thirteenth-month/lines/{line}/pdf'
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
const thirteenthMonth = {
    index: Object.assign(index, index),
preview: Object.assign(preview, preview),
lines: Object.assign(lines, lines),
generate: Object.assign(generate, generate),
finalize: Object.assign(finalize, finalize),
pdf: Object.assign(pdf, pdf),
}

export default thirteenthMonth