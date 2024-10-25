<?php defined( 'ABSPATH' ) || exit;
if (!class_exists('WPSE_Users_Spreadsheet_Bootstrap')) {

	class WPSE_Users_Spreadsheet_Bootstrap extends WP_Sheet_Editor_Bootstrap {

		/**
		 * Register core toolbar items
		 */
		function _register_toolbars($post_types = array(), $toolbars = null) {
			$toolbars = parent::_register_toolbars($post_types, $toolbars);

			if (!WP_Sheet_Editor_Helpers::current_user_can('create_users')) {
				$toolbars->remove_item('add_rows', 'primary', 'user');
				$toolbars->remove_item('add_rows', 'secondary', 'user');
			}
			return $toolbars;
		}

		function render_quick_access() {
			$screen = get_current_screen();
			if ($screen->id === 'users' && in_array('user', $this->enabled_post_types)) {
				?>
				<script>jQuery(document).ready(function () {
						jQuery('.page-title-action').last().after('<a href=<?php echo json_encode(esc_url(VGSE()->helpers->get_editor_url('user'))); ?> class="page-title-action"><?php _e('Edit in a Spreadsheet', vgse_users()->textname); ?></a>');
					});</script>

				<?php
			}
		}

		function _register_admin_menu() {
			if (WP_Sheet_Editor_Helpers::current_user_can('edit_users')) {
				$users_submenu_parent = 'users.php';
			} else {
				$users_submenu_parent = 'profile.php';
			}

			$admin_menu_slug = 'vgse-bulk-edit-user';
			$required_capability = VGSE()->helpers->get_edit_spreadsheet_capability('user');
			$admin_menu = array(
				array(
					'type' => 'submenu',
					'name' => __('Edit Users', vgse_users()->textname),
					'slug' => $admin_menu_slug,
					'capability' => $required_capability
				),
				array(
					'type' => 'submenu',
					'name' => __('Bulk Editor', vgse_users()->textname),
					'parent' => $users_submenu_parent,
					'slug' => 'admin.php?page=' . $admin_menu_slug,
					'treat_as_url' => true,
					'capability' => $required_capability
				),
			);

			return $admin_menu;
		}

		function get_editable_roles() {
			return array_keys(get_editable_roles());
		}

		public function get_user_role( $user, $cell_key, $cell_args ) {			
			$value = current( $user->roles );
			return $value;
		}
		public function get_user_password( $user, $cell_key, $cell_args ) {
			return '';
		}

		function _register_columns() {
			$post_type = 'user';
			$this->columns->register_item('ID', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 75, 
				'title' => __('ID', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => false,
				'allow_to_hide' => false,
				'allow_to_save' => false,
				'allow_to_rename' => false,
				'is_locked' => true,
			));
			$this->columns->register_item('user_email', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 210, 
				'title' => __('Email', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'value_type' => 'email',
			));
			$this->columns->register_item('user_login', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Login', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('role', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Role', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'supports_sql_formulas' => false,
				'allow_to_hide' => true,
				'allow_to_save' => WP_Sheet_Editor_Helpers::current_user_can('promote_users'),
				'allow_to_rename' => true,
				'formatted' => array(
					'editor' => 'select',
					'selectOptions' => array($this, 'get_editable_roles'),
					'callback_args' => array()
				),
				'get_value_callback'    => array( $this, 'get_user_role' ),
			));
			$this->columns->register_item('wpse_status', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Status', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'skip_blacklist' => true,
				'allow_to_rename' => true,
				'default_value' => 'active',
				'formatted' => array('editor' => 'select', 'selectOptions' => array(
						'active',
						'delete',
					)),
			));
			$this->columns->register_item('first_name', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('First name', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('last_name', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Last name', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('description', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 310, 
				'title' => __('Description', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('user_registered', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 190, 
				'title' => __('Registration date', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'is_locked' => true,
				'lock_template_key' => 'enable_lock_cell_template'
			));
			$this->columns->register_item('user_pass', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('New password', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'get_value_callback'    => array( $this, 'get_user_password' ),
			));
			$this->columns->register_item('user_nicename', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Nicename', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('user_url', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Website', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('display_name', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Display name', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('nickname', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Nickname', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
			));
			$this->columns->register_item('rich_editing', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 120, 
				'title' => __('Rich editing', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'formatted' => array(
					'type' => 'checkbox',
					'checkedTemplate' => true,
					'uncheckedTemplate' => false,
				),
				'default_value' => true,
			));
			$this->columns->register_item('comment_shortcuts', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Comment shortcuts', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'formatted' => array(
					'type' => 'checkbox',
					'checkedTemplate' => true,
					'uncheckedTemplate' => false,
				),
				'default_value' => true,
			));
			$this->columns->register_item('admin_color', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Color scheme', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'formatted' => array('editor' => 'select', 'selectOptions' => array(
						'fresh',
						'light',
						'blue',
						'coffee',
						'ectoplasm',
						'midnight',
						'ocean',
						'sunrise',
					)),
			));
			$this->columns->register_item('show_admin_bar_front', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 190, 
				'title' => __('Show admin bar on frontend', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'formatted' => array(
					'type' => 'checkbox',
					'checkedTemplate' => 'true',
					'uncheckedTemplate' => 'false',
				),
				'default_value' => 'false',
			));
			$languages = array(
				'' => 'en_US',
			);
			$available_languages = get_available_languages();

			foreach ($available_languages as $available_language) {
				$languages[$available_language] = $available_language;
			}
			$this->columns->register_item('locale', $post_type, array(
				'data_type' => 'post_data', 	
				'column_width' => 150, 
				'title' => __('Language', vgse_users()->textname),
				'type' => '',
				'supports_formulas' => true,
				'allow_to_hide' => true,
				'allow_to_save' => true,
				'allow_to_rename' => true,
				'formatted' => array('editor' => 'select', 'selectOptions' => $languages),
			));
		}

	}

}