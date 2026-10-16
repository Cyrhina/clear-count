import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import plans from './plans'
/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/benefits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BenefitController::index
 * @see app/Http/Controllers/BenefitController.php:79
 * @route '/api/benefits'
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
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/benefits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::store
 * @see app/Http/Controllers/BenefitController.php:85
 * @route '/api/benefits'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
export const update = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/benefits/{employeeBenefit}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
update.url = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeBenefit: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { employeeBenefit: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    employeeBenefit: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        employeeBenefit: typeof args.employeeBenefit === 'object'
                ? args.employeeBenefit.id
                : args.employeeBenefit,
                }

    return update.definition.url
            .replace('{employeeBenefit}', parsedArgs.employeeBenefit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
update.put = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
    const updateForm = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BenefitController::update
 * @see app/Http/Controllers/BenefitController.php:107
 * @route '/api/benefits/{employeeBenefit}'
 */
        updateForm.put = (args: { employeeBenefit: number | { id: number } } | [employeeBenefit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const benefits = {
    index: Object.assign(index, index),
plans: Object.assign(plans, plans),
store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default benefits