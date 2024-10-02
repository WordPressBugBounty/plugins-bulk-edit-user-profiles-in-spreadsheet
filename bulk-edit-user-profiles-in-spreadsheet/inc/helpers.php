<?php

defined( 'ABSPATH' ) || exit;
if ( !class_exists( 'VGSE_Users_Helpers' ) ) {
    class VGSE_Users_Helpers {
        private static $instance = false;

        private function __construct() {
        }

        function init() {
        }

        function get_all_the_roles() {
            $roles = wp_roles();
            return wp_list_pluck( $roles->roles, 'name' );
        }

        function get_available_user_roles() {
            $out = array(
                'subscriber' => __( 'Subscriber', vgse_users()->textname ),
            );
            return apply_filters( 'wpse_users_allowed_roles', $out );
        }

        /**
         * Creates or returns an instance of this class.
         *
         * @return  Foo A single instance of this class.
         */
        static function get_instance() {
            if ( null == VGSE_Users_Helpers::$instance ) {
                VGSE_Users_Helpers::$instance = new VGSE_Users_Helpers();
                VGSE_Users_Helpers::$instance->init();
            }
            return VGSE_Users_Helpers::$instance;
        }

        function __set( $name, $value ) {
            $this->{$name} = $value;
        }

        function __get( $name ) {
            return $this->{$name};
        }

    }

}
if ( !function_exists( 'VGSE_Users_Helpers_Obj' ) ) {
    function VGSE_Users_Helpers_Obj() {
        return VGSE_Users_Helpers::get_instance();
    }

}