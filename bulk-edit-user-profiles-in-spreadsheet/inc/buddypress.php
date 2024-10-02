<?php

defined( 'ABSPATH' ) || exit;
if ( !class_exists( 'WPSE_BuddyPress_Custom_Fields' ) ) {
    class WPSE_BuddyPress_Custom_Fields {
        private static $instance = false;

        private function __construct() {
        }

        function init() {
            add_action( 'vg_sheet_editor/editor/register_columns', array($this, 'register_columns') );
        }

        function register_columns( $editor ) {
            if ( !function_exists( 'bp_xprofile_get_groups' ) ) {
                return;
            }
            if ( $editor->provider->key !== 'user' ) {
                return;
            }
            $groups = bp_xprofile_get_groups( array(
                'fetch_fields' => true,
            ) );
            $column_args_override = array();
            $column_args_override = array(
                'is_locked'         => true,
                'lock_template_key' => 'lock_cell_template_pro',
            );
            foreach ( $groups as $group ) {
                foreach ( $group->fields as $field ) {
                    $field_key = implode( '_', array($field->id, $field->group_id, 'bb') );
                    $args = array(
                        'data_type'           => 'post_data',
                        'title'               => sprintf( __( 'BP: %s', vgse_users()->textname ), esc_html( $field->name ) ),
                        'supports_formulas'   => true,
                        'get_value_callback'  => array($this, 'get_field_value'),
                        'save_value_callback' => array($this, 'save_field_value'),
                        'bp_field'            => array(
                            'id'   => $field->id,
                            'type' => $field->type,
                        ),
                        'column_width'        => 150,
                    );
                    if ( in_array( $field->type, array('selectbox', 'radio') ) ) {
                        $args['formatted'] = array(
                            'editor'        => 'select',
                            'selectOptions' => wp_list_pluck( $field->get_children(), 'name' ),
                        );
                    } elseif ( in_array( $field->type, array('datebox') ) ) {
                        $args['formatted'] = array(
                            'type'             => 'date',
                            'dateFormatPhp'    => 'Y-m-d',
                            'correctFormat'    => true,
                            'defaultDate'      => date( 'Y-m-d' ),
                            'datePickerConfig' => array(
                                'firstDay'       => 0,
                                'showWeekNumber' => true,
                                'numberOfMonths' => 1,
                            ),
                        );
                    }
                    $editor->args['columns']->register_item( $field_key, $editor->provider->key, wp_parse_args( $column_args_override, $args ) );
                }
            }
            if ( function_exists( 'bp_get_member_types' ) ) {
                $editor->args['columns']->register_item( 'bp-members-profile-member-type', $editor->provider->key, array(
                    'data_type'             => 'meta_data',
                    'column_width'          => 200,
                    'title'                 => __( 'Profile type', vgse_users()->textname ),
                    'type'                  => '',
                    'supports_formulas'     => true,
                    'supports_sql_formulas' => false,
                    'allow_to_hide'         => true,
                    'allow_to_rename'       => true,
                    'allow_plain_text'      => true,
                    'get_value_callback'    => array($this, 'get_profile_type'),
                    'save_value_callback'   => array($this, 'save_profile_type'),
                    'allow_to_save'         => true,
                    'formatted'             => array(
                        'editor'        => 'select',
                        'selectOptions' => bp_get_member_types(),
                    ),
                ) );
            }
        }

        function save_profile_type(
            $post_id,
            $cell_key,
            $data_to_save,
            $post_type,
            $cell_args,
            $spreadsheet_columns
        ) {
            bp_set_member_type( $post_id, $data_to_save );
        }

        function get_profile_type( $post, $cell_key, $cell_args ) {
            $value = bp_get_member_type( $post->ID, true );
            return ( $value ? (string) $value : '' );
        }

        function get_field_value( $post, $cell_key, $cell_args ) {
            $field_key_parts = explode( '_', $cell_key );
            $field_id = (int) current( $field_key_parts );
            $value = xprofile_get_field_data( $field_id, $post->ID, 'comma' );
            if ( !empty( $cell_args['bp_field'] ) ) {
                if ( $cell_args['bp_field']['type'] === 'datebox' && !empty( $value ) ) {
                    $value = BP_XProfile_ProfileData::get_value_byid( $field_id, $post->ID );
                    $value = date( 'Y-m-d', strtotime( $value ) );
                }
            }
            return $value;
        }

        function save_field_value(
            $post_id,
            $cell_key,
            $data_to_save,
            $post_type,
            $cell_args,
            $spreadsheet_columns
        ) {
            $field_key_parts = explode( '_', $cell_key );
            $field_id = (int) current( $field_key_parts );
            if ( !empty( $cell_args['bp_field'] ) ) {
                if ( in_array( $cell_args['bp_field']['type'], array('checkbox', 'multiselectbox') ) ) {
                    $data_to_save = array_map( 'trim', explode( ',', $data_to_save ) );
                }
                if ( in_array( $cell_args['bp_field']['type'], array('datebox') ) ) {
                    $data_to_save = date( 'Y-m-d H:i:s', strtotime( $data_to_save ) );
                }
            }
            xprofile_set_field_data( $field_id, $post_id, $data_to_save );
        }

        static function get_instance() {
            if ( null == WPSE_BuddyPress_Custom_Fields::$instance ) {
                WPSE_BuddyPress_Custom_Fields::$instance = new WPSE_BuddyPress_Custom_Fields();
                WPSE_BuddyPress_Custom_Fields::$instance->init();
            }
            return WPSE_BuddyPress_Custom_Fields::$instance;
        }

        function __set( $name, $value ) {
            $this->{$name} = $value;
        }

        function __get( $name ) {
            return $this->{$name};
        }

    }

}
if ( !function_exists( 'WPSE_BuddyPress_Custom_Fields_Obj' ) ) {
    function WPSE_BuddyPress_Custom_Fields_Obj() {
        return WPSE_BuddyPress_Custom_Fields::get_instance();
    }

}
WPSE_BuddyPress_Custom_Fields_Obj();