import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\CompanyInfoController::store
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/company-info/logo',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::store
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::store
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::store
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::store
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CompanyInfoController::destroy
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/company-info/logo',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::destroy
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::destroy
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::destroy
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
    const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::destroy
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
        destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const logo = {
    store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
}

export default logo