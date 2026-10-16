import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::index
 * @see app/Http/Controllers/OpsController.php:61
 * @route '/payroll'
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
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/payroll/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::show
 * @see app/Http/Controllers/OpsController.php:66
 * @route '/payroll/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
export const inputs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inputs.url(options),
    method: 'get',
})

inputs.definition = {
    methods: ["get","head"],
    url: '/payroll-inputs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
inputs.url = (options?: RouteQueryOptions) => {
    return inputs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
inputs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inputs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
inputs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: inputs.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
    const inputsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: inputs.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
        inputsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inputs.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::inputs
 * @see app/Http/Controllers/OpsController.php:71
 * @route '/payroll-inputs'
 */
        inputsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inputs.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    inputs.form = inputsForm
const payroll = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
inputs: Object.assign(inputs, inputs),
}

export default payroll