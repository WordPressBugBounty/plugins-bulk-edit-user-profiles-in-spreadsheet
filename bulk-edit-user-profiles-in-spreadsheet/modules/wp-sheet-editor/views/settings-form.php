<?php defined( 'ABSPATH' ) || exit; ?>

<h3><?php esc_html_e( 'Advanced Settings', 'vg_sheet_editor' ); ?></h3>

<?php
$section_keys  = ! empty( $sections ) ? array_keys( $sections ) : array();
$first_tab_key = ! empty( $section_keys ) ? $section_keys[0] : '';
?>

<div class="wpse-settings-form-wrapper" x-data="wpseSettingsComponent('<?php echo esc_attr( $first_tab_key ); ?>')">

	<div class="tabs-links">
		<?php
		foreach ( $sections as $tab_index => $section ) {
			?>
			<a href="#tab<?php echo sanitize_html_class( $tab_index ); ?>"
				x-show="isTabVisible('tab<?php echo sanitize_html_class( $tab_index ); ?>')"
				@click.prevent="activeTab = 'tab<?php echo sanitize_html_class( $tab_index ); ?>'"
				:class="{ 'tab-active': activeTab === 'tab<?php echo sanitize_html_class( $tab_index ); ?>' }"><?php echo esc_html( $section['title'] ); ?></a>
			<?php
		}
		?>

		<a href="#reset-settings" x-show="!search" @click.prevent="activeTab = 'reset-settings'" :class="{ 'tab-active': activeTab === 'reset-settings' }"><?php esc_html_e( 'Reset settings', 'vg_sheet_editor' ); ?></a>
		<a href="#export-import-settings" x-show="!search" @click.prevent="activeTab = 'export-import-settings'" :class="{ 'tab-active': activeTab === 'export-import-settings' }"><?php esc_html_e( 'Export and import settings', 'vg_sheet_editor' ); ?></a>
		<?php do_action( 'vg_sheet_editor/settings/after_tab_links', $provider, $sections ); ?>
	</div>

	<form class="wpse-set-settings tabs-content" data-reload-after-success="1">
		<input type="search" x-model.debounce.350ms="search" placeholder="<?php esc_attr_e( 'Search settings...', 'vg_sheet_editor' ); ?>" class="wpse-settings-search" style="width: 100%; margin-bottom: 15px; padding: 8px;">

		<?php
		foreach ( $sections as $tab_index => $section ) {
			?>
			<div id="tab<?php echo sanitize_html_class( $tab_index ); ?>" class="<?php echo esc_attr( $section['title'] ); ?> tab-content" x-show="activeTab === 'tab<?php echo sanitize_html_class( $tab_index ); ?>'">
				<?php
				foreach ( $section['fields'] as $field ) {
					$value = isset( VGSE()->options[ $field['id'] ] ) ? VGSE()->options[ $field['id'] ] : '';
					if ( is_numeric( $value ) && isset( $field['default'] ) && is_int( $field['default'] ) ) {
						$value = (int) $value;
					}
					$input_type = ! empty( $field['validate'] ) && $field['validate'] === 'numeric' ? 'number' : 'text';
					if ( ! empty( $field['default'] ) ) {
						$default_value_text = esc_html__( 'Default value: ', 'vg_sheet_editor' ) . $field['default'];
						$field['desc']      = ! empty( $field['desc'] ) ? $field['desc'] . '. ' . $default_value_text : $default_value_text;
					}
					?>
					<div class="field-wrapper" x-show="isFieldVisible($el)">
						<?php
						if ( $field['type'] === 'info' ) {
							echo wp_kses_post( $field['desc'] );
						} else { ?>						
							<label for="<?php echo esc_attr( $field['id'] ); ?>">
								<?php if ( $field['type'] === 'switch' ) { ?>
									<input name="settings[<?php echo esc_attr( $field['id'] ); ?>]" type="hidden" value="" />
									<input class="<?php echo sanitize_html_class( $field['class_name'] ); ?>" id="<?php echo esc_attr( $field['id'] ); ?>" name="settings[<?php echo esc_attr( $field['id'] ); ?>]" type="checkbox" value="1" <?php checked( 1, (int) $value ); ?> />
								<?php } ?>
								<?php echo esc_html( $field['title'] ); ?>

								<?php if ( ! empty( $field['desc'] ) ) { ?>
									<a href="#" data-wpse-tooltip="right" aria-label="<?php echo esc_attr( $field['desc'] ); ?>">( ? )</a>
								<?php } ?>
							</label>

							<?php if ( $field['type'] === 'text' ) { ?>
								<input class="<?php echo sanitize_html_class( $field['class_name'] ); ?>" id="<?php echo esc_attr( $field['id'] ); ?>" name="settings[<?php echo esc_attr( $field['id'] ); ?>]" value="<?php echo esc_attr( $value ); ?>" type="<?php echo esc_attr( $input_type ); ?>" 
																		<?php
																		if ( ! empty( $field['min'] ) ) {
																			echo ' min="' . (int) $field['min'] . '" ';}
																		?>
								/>
							<?php } ?>
							<?php if ( $field['type'] === 'textarea' ) { ?>
								<textarea class="<?php echo sanitize_html_class( $field['class_name'] ); ?>" id="<?php echo esc_attr( $field['id'] ); ?>" name="settings[<?php echo esc_attr( $field['id'] ); ?>]"><?php echo esc_attr( $value ); ?></textarea>
							<?php } ?>
							<?php
							if ( $field['type'] === 'new_select' ) {
								if ( is_callable( $field['options'] ) ) {
									$field['options'] = call_user_func( $field['options'] );
								}
								$input_name = empty( $field['multi'] ) ? 'settings[' . $field['id'] . ']' : 'settings[' . $field['id'] . '][]';
								if ( ! isset( $field['options'][''] ) ) {
									$field['options'][''] = '---';
								}
								?>

								<select class="<?php echo sanitize_html_class( $field['class_name'] ); ?>" 
										<?php
										if ( ! empty( $field['multi'] ) ) {
											echo 'multiple';
										}
										?>
										id="<?php echo esc_attr( $field['id'] ); ?>" name="<?php echo esc_attr( $input_name ); ?>">
									<?php
									foreach ( $field['options'] as $option_key => $option_label ) {
										?>
										<option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( is_array( $value ) ? in_array( $option_key, $value, true ) : $value === $option_key ); ?>><?php echo esc_html( $option_label ); ?></option>
										<?php
									}
									?>
								</select>
							<?php } 
						} ?>
					</div>
					<?php
				}
				?>
			</div>
			<?php
		}
		?>

		<div class="reset-settings tab-content" x-show="activeTab === 'reset-settings'">
			<p><?php esc_html_e( 'We will display all the columns that were deleted or disabled, renamed columns will show the original titles, we will rescan the database to find columns again, and the speed/advanced settings will be reset to the defaults. This only affects settings of our plugin and it does not affect the data edited with the sheet.', 'vg_sheet_editor' ); ?></p>
			<a href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wpse_hard_reset', 1 ), 'wpse', 'wpse_nonce' ) ); ?>"><?php esc_html_e( 'Reset settings', 'vg_sheet_editor' ); ?></a>
		</div>
		<div class="export-import-settings tab-content" x-show="activeTab === 'export-import-settings'">
			<p><?php esc_html_e( 'These options will be included in the export and import:', 'vg_sheet_editor' ); ?></p>
			<ol>
				<li><?php esc_html_e( 'Column sizes', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Column titles', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Column settings defined in the columns manager', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Columns created manually', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Advanced settings', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Saved exports', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Saved searches', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'List of deleted columns', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Favorite search fields', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Column groups', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Post types created with WP Sheet Editor', 'vg_sheet_editor' ); ?></li>
			</ol>
			<hr>
			<a target="_blank" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'wpse_export_settings', 1 ), 'wpse', 'wpse_nonce' ) ); ?>"><?php esc_html_e( 'Click here to export the settings', 'vg_sheet_editor' ); ?></a>
			<hr>
			<label><b><?php esc_html_e( 'Import settings', 'vg_sheet_editor' ); ?></b></label>
			<p><?php esc_html_e( 'Paste the settings here (the contents of the exported file). Notes:', 'vg_sheet_editor' ); ?></p>
			<ol>
				<li><?php esc_html_e( 'The import will overwrite existing settings', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Please make a database backup before the import to be safe', 'vg_sheet_editor' ); ?></li>
				<li><?php esc_html_e( 'Some columns depend on other plugins. So the source site and this site must use the same plugins to have the same columns', 'vg_sheet_editor' ); ?></li>
			</ol>
			<textarea name="wpse_import_settings" style="min-height: 150px;"></textarea>

		</div>
		<?php do_action( 'vg_sheet_editor/settings/after_tabs_content', $provider, $sections ); ?>
		<br>
		<div class="actions">
			<button type="submit" class="remodal-confirm"><?php esc_html_e( 'Save', 'vg_sheet_editor' ); ?></button>
			<button type="button" data-remodal-action="confirm" class="remodal-cancel"><?php esc_html_e( 'Close', 'vg_sheet_editor' ); ?></button>
		</div>
	</form>
</div>
