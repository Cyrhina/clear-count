import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
const showd11f12cb1c61d6243f8bde8563f4ea6f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showd11f12cb1c61d6243f8bde8563f4ea6f.url(options),
    method: 'get',
})

showd11f12cb1c61d6243f8bde8563f4ea6f.definition = {
    methods: ["get","head"],
    url: '/api/company',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
showd11f12cb1c61d6243f8bde8563f4ea6f.url = (options?: RouteQueryOptions) => {
    return showd11f12cb1c61d6243f8bde8563f4ea6f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
showd11f12cb1c61d6243f8bde8563f4ea6f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showd11f12cb1c61d6243f8bde8563f4ea6f.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
showd11f12cb1c61d6243f8bde8563f4ea6f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showd11f12cb1c61d6243f8bde8563f4ea6f.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
    const showd11f12cb1c61d6243f8bde8563f4ea6fForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showd11f12cb1c61d6243f8bde8563f4ea6f.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
        showd11f12cb1c61d6243f8bde8563f4ea6fForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showd11f12cb1c61d6243f8bde8563f4ea6f.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
        showd11f12cb1c61d6243f8bde8563f4ea6fForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showd11f12cb1c61d6243f8bde8563f4ea6f.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showd11f12cb1c61d6243f8bde8563f4ea6f.form = showd11f12cb1c61d6243f8bde8563f4ea6fForm
    /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
const show5f7508f71dd77f64f4ad86bdfd4aabfc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show5f7508f71dd77f64f4ad86bdfd4aabfc.url(options),
    method: 'get',
})

show5f7508f71dd77f64f4ad86bdfd4aabfc.definition = {
    methods: ["get","head"],
    url: '/api/company-info',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
show5f7508f71dd77f64f4ad86bdfd4aabfc.url = (options?: RouteQueryOptions) => {
    return show5f7508f71dd77f64f4ad86bdfd4aabfc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
show5f7508f71dd77f64f4ad86bdfd4aabfc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show5f7508f71dd77f64f4ad86bdfd4aabfc.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
show5f7508f71dd77f64f4ad86bdfd4aabfc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show5f7508f71dd77f64f4ad86bdfd4aabfc.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
    const show5f7508f71dd77f64f4ad86bdfd4aabfcForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show5f7508f71dd77f64f4ad86bdfd4aabfc.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
        show5f7508f71dd77f64f4ad86bdfd4aabfcForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show5f7508f71dd77f64f4ad86bdfd4aabfc.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
        show5f7508f71dd77f64f4ad86bdfd4aabfcForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show5f7508f71dd77f64f4ad86bdfd4aabfc.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show5f7508f71dd77f64f4ad86bdfd4aabfc.form = show5f7508f71dd77f64f4ad86bdfd4aabfcForm

/**
* Multiple routes resolve to \App\Http\Controllers\CompanyInfoController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/company': showd11f12cb1c61d6243f8bde8563f4ea6f,
    '/api/company-info': show5f7508f71dd77f64f4ad86bdfd4aabfc,
}

/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put","post"],
    url: '/api/company-info',
} satisfies RouteDefinition<["put","post"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
        updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(options),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\CompanyInfoController::uploadLogo
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
export const uploadLogo = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadLogo.url(options),
    method: 'post',
})

uploadLogo.definition = {
    methods: ["post"],
    url: '/api/company-info/logo',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::uploadLogo
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
uploadLogo.url = (options?: RouteQueryOptions) => {
    return uploadLogo.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::uploadLogo
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
uploadLogo.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadLogo.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::uploadLogo
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
    const uploadLogoForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadLogo.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::uploadLogo
 * @see app/Http/Controllers/CompanyInfoController.php:62
 * @route '/api/company-info/logo'
 */
        uploadLogoForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadLogo.url(options),
            method: 'post',
        })
    
    uploadLogo.form = uploadLogoForm
/**
* @see \App\Http\Controllers\CompanyInfoController::removeLogo
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
export const removeLogo = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeLogo.url(options),
    method: 'delete',
})

removeLogo.definition = {
    methods: ["delete"],
    url: '/api/company-info/logo',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::removeLogo
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
removeLogo.url = (options?: RouteQueryOptions) => {
    return removeLogo.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::removeLogo
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
removeLogo.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeLogo.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::removeLogo
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
    const removeLogoForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: removeLogo.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::removeLogo
 * @see app/Http/Controllers/CompanyInfoController.php:79
 * @route '/api/company-info/logo'
 */
        removeLogoForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: removeLogo.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    removeLogo.form = removeLogoForm
const CompanyInfoController = { show, update, uploadLogo, removeLogo }

export default CompanyInfoController