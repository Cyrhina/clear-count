<?php

test('home redirects to the login page', function () {
    $this->get(route('home'))->assertRedirect(route('login'));
});
