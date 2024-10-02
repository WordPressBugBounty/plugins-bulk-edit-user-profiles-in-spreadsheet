<?php

defined( 'ABSPATH' ) || exit;
// Create a helper function for easy SDK access.
if ( !function_exists( 'beupis_fs' ) ) {
    function beupis_fs() {
        global $beupis_fs;
        if ( !isset( $beupis_fs ) ) {
            if ( !defined( 'WP_FS__PRODUCT_1124_MULTISITE' ) ) {
                define( 'WP_FS__PRODUCT_1124_MULTISITE', true );
            }
            $beupis_fs = fs_dynamic_init( array(
                'id'             => '1124',
                'slug'           => 'bulk-edit-user-profiles-in-spreadsheet',
                'type'           => 'plugin',
                'public_key'     => 'pk_2126d6c94c59eee644896785c26f9',
                'is_premium'     => false,
                'has_addons'     => false,
                'has_paid_plans' => true,
                'menu'           => array(
                    'slug'       => 'wpseu_welcome_page',
                    'first-path' => 'admin.php?page=wpseu_welcome_page',
                    'support'    => false,
                ),
                'is_live'        => true,
            ) );
        }
        return $beupis_fs;
    }

    // Init Freemius.
    beupis_fs();
    beupis_fs()->add_filter( 'show_deactivation_feedback_form', '__return_false' );
}
// Signal that SDK was initiated.
do_action( 'beupis_fs_loaded' );