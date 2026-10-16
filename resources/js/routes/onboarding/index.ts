import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/onboarding',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OnboardingController::index
 * @see app/Http/Controllers/OnboardingController.php:18
 * @route '/api/onboarding'
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
const onboarding = {
    index: Object.assign(index, index),
}

export default onboarding