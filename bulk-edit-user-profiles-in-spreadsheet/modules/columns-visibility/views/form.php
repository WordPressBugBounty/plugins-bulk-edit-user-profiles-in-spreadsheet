<?php 
/**
 * @var string $post_type
 * @var array $visible_columns
 * @var array $options
 * @var WP_Sheet_Editor_Factory $editor
 * @var string $partial_form
 */

defined( 'ABSPATH' ) || exit; ?>
<div data-remodal-id="modal-columns-visibility" data-remodal-options="closeOnOutsideClick: false" class="remodal modal-columns-visibility remodal-large" x-data="vgseColumnsManager">

	<div class="modal-content">
		<?php if ( ! $partial_form ) { ?>
		<form action="<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>" method="POST" class="vgse-modal-form" id="columns-manager-form" @submit.prevent="submitForm">
			<?php } ?>
			<h3><?php esc_html_e( 'Columns manager', 'vg_sheet_editor' ); ?></h3>
			<ul class="unstyled-list">
				<li>
					<p><?php esc_html_e( 'Drag the columns to the left or right side to enable/disable them, drag them to the top or bottom to sort them, click on the "edit" button to rename them, click on the "x" button to delete them completely (only when they are disabled previously).', 'vg_sheet_editor' ); ?><?php do_action( 'vg_sheet_editor/columns_visibility/after_instructions', $post_type, $visible_columns, $options[ $post_type ], $editor ); ?>
					</p>
				</li>
				<li class="column-lists" 
           x-ref="scrollContainer" 
    @scroll.debounce.10ms="handleSharedScroll($event)">
    <div class="column-wrapper">
					<div tabIndex="-1" class="vgse-sorter-section" :style="{ height: `${sharedTotalHeight}px` }">

						<h3><?php esc_html_e( 'Enabled', 'vg_sheet_editor' ); ?> (<span x-text="getFilteredEnabledColumns().length"></span>) <button @click.prevent="showBulkActions = !showBulkActions; bulkToggleClicked = 'enabled'" type="button"

								class="toggle-search-button"><i class="fa fa-edit"></i>
								<?php esc_html_e( 'Bulk', 'vg_sheet_editor' ); ?></button></h3>
								<template  x-if="showBulkActions">
						<div class="wpse-columns-bulk-actions" x-init="if(bulkToggleClicked == 'enabled') { $refs.enabledSearchInput.focus()}">
							<input x-model.debounce.500ms="enabledSearchTerm" x-ref="enabledSearchInput" type="search" class="wpse-filter-list"
								placeholder="<?php esc_html_e( 'Enter a search term...', 'vg_sheet_editor' ); ?>">
							<select class="wpse-bulk-action" x-model="enabledBulkAction" @change="handleBulkAction('enabled')">
								<option value=""><?php esc_html_e( 'Bulk actions', 'vg_sheet_editor' ); ?></option>
								<option value="disable_empty"><?php esc_html_e( 'Disable all empty columns', 'vg_sheet_editor' ); ?></option>
								<option value="disable_unused" x-show="used_columns.length > 4"><?php esc_html_e( 'Disable columns that you never used', 'vg_sheet_editor' ); ?></option>
								<option value="disable"><?php esc_html_e( 'Disable all', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_asc">
									<?php esc_html_e( 'Sort alphabetically ASC', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_desc">
									<?php esc_html_e( 'Sort alphabetically DESC', 'vg_sheet_editor' ); ?></option>
							</select>
						</div>
						</template>

						<ul class="vgse-sorter columns-enabled virtual-content" 
                :style="enabledList ? enabledList.contentStyle : ''" 
                x-ref="enabledList" id="vgse-columns-enabled">
						<template x-if="showColumnsList && enabledList">
							<!-- Must use the key with random id to be able to use the sortable() function, otherwise Alpine will reuse DOM elements and lose track of the order -->
							<template x-for="column in enabledList.visibleItems" :key="column.key + column.order">
								<li :data-column-key="column.key" :data-column-title="column.title"><span class="handle">::</span> <span class="column-title" :title="column.title"
										x-text="column.title"></span> 
										<template x-if="vgse_editor_settings && !vgse_editor_settings.columnsFormat[column.key]">
											<i class="fa fa-refresh" data-wpse-tooltip="right"
										aria-label="cm_requires_reload">&#xf021;</i>
										</template>

									<button class="deactivate-column column-action"
										title="<?php echo esc_attr( esc_html__( 'Disable column. You can enable it later.', 'vg_sheet_editor' ) ); ?>" @click.prevent="deactivateColumn(column.key)"><i
											class="fa fa-arrow-right"></i></button>
											<template x-if="Object.keys(vgseColumnsManager.prepared_columns).length > 10">
									<button title="<?php esc_attr_e( 'Move column to the top of the list', 'vg_sheet_editor' ); ?>" class="move-column-up column-action" @click.prevent.debounce.500ms="moveColumnUp(column.key)"><i class="fa fa-arrow-up"></i></button>
											</template>
											<template x-if="Object.keys(vgseColumnsManager.prepared_columns).length > 10">
									<button title="<?php esc_attr_e( 'Move column to the bottom of the list', 'vg_sheet_editor' ); ?>" class="move-column-down column-action" @click.prevent.debounce.500ms="moveColumnDown(column.key)"><i class="fa fa-arrow-down"></i></button>
											</template>
									<?php do_action( 'vg_sheet_editor/columns_visibility/enabled/after_column_action_alpine', $post_type ); ?>
									<div class="clear"></div>
								</li>
							</template>
						</template>
						</ul>
					</div>
					<div tabIndex="-1" class="vgse-sorter-section" :style="{ height: `${sharedTotalHeight}px` }">
						<h3><?php esc_html_e( 'Disabled', 'vg_sheet_editor' ); ?> (<span x-text="getFilteredDisabledColumns().length"></span>) <button @click.prevent="showBulkActions = !showBulkActions; bulkToggleClicked = 'disabled'" type="button"
								class="toggle-search-button"><i class="fa fa-edit"></i>
								<?php esc_html_e( 'Bulk', 'vg_sheet_editor' ); ?></button></h3>

								<template  x-if="showBulkActions">
						<div class="wpse-columns-bulk-actions" x-init="if(bulkToggleClicked == 'disabled') { $refs.disabledSearchInput.focus() }">
							<input x-model.debounce.500ms="disabledSearchTerm" x-ref="disabledSearchInput" type="search" class="wpse-filter-list"
								placeholder="<?php esc_html_e( 'Enter a search term...', 'vg_sheet_editor' ); ?>">							
							<select class="wpse-bulk-action" x-model="disabledBulkAction" @change="handleBulkAction('disabled')">
								<option value=""><?php esc_html_e( 'Bulk actions', 'vg_sheet_editor' ); ?></option>
								<option value="enable"><?php esc_html_e( 'Enable all', 'vg_sheet_editor' ); ?></option>
								<option value="delete"><?php esc_html_e( 'Hide all', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_asc">
									<?php esc_html_e( 'Sort alphabetically ASC', 'vg_sheet_editor' ); ?></option>
								<option value="sort_alphabetically_desc">
									<?php esc_html_e( 'Sort alphabetically DESC', 'vg_sheet_editor' ); ?></option>
							</select>
						</div>
								</template>
						<ul class="vgse-sorter columns-disabled virtual-content":style="disabledList ? disabledList.contentStyle : ''" 
                x-ref="disabledList" id="vgse-columns-disabled">
						<template x-if="showColumnsList && disabledList">
							<template x-for="column in disabledList.visibleItems" :key="column.key + column.order">
								<li :data-column-key="column.key" :data-column-title="column.title">
									<span class="handle">::</span> <span class="column-title" :title="column.title"
										x-text="column.title"></span> 
										
										<template x-if="vgse_editor_settings && !vgse_editor_settings.columnsFormat[column.key]">
											<i class="fa fa-refresh" data-wpse-tooltip="right"
										aria-label="cm_requires_reload">&#xf021;</i>
										</template>

									<?php if ( VGSE()->helpers->user_can_manage_options() ) { ?>
									<button type="button" class="remove-column column-action"
										title="<?php echo esc_attr( esc_html__( 'The column values will remain in the database, this only excludes/hides the column from the list.', 'vg_sheet_editor' ) ); ?>" @click.prevent="deleteColumn(column.key)"><i
											class="fa fa-remove"></i></button>
									<?php } ?>
									<button class="enable-column column-action"
										title="<?php echo esc_attr( esc_html__( 'Enable column', 'vg_sheet_editor' ) ); ?>" @click.prevent="enableColumn(column.key)"><i
											class="fa fa-arrow-left"></i></button>
									<?php do_action( 'vg_sheet_editor/columns_visibility/disabled/after_column_action_alpine', $post_type ); ?>
									<div class="clear"></div>
								</li>
							</template>
								</template>
						</ul>
					</div>
						<div class="clear"></div>
	</div>
					
				<?php if ( is_admin() && VGSE()->helpers->user_can_manage_options() ) { ?>
				<div class="missing-column-tips" x-data="{showMissingColumnTips: false}">
					<p><?php esc_html_e( 'A column is missing?', 'vg_sheet_editor' ); ?> <a href="#"
							@click.prevent="showMissingColumnTips = !showMissingColumnTips"><?php esc_html_e( 'Read more', 'vg_sheet_editor' ); ?></a>
					</p>

					<template x-if="showMissingColumnTips">
						<ul>
							<li><?php esc_html_e( '- First, edit one item in the normal editor and fill all the fields manually.', 'vg_sheet_editor' ); ?>
							</li>
							<?php
							if ( empty( $options[ $post_type ]['enabled'] ) ) {
								$options[ $post_type ]['enabled'] = array();
							}
							if ( empty( $options[ $post_type ]['disabled'] ) ) {
								$options[ $post_type ]['disabled'] = array();
							}
							?>
							<li><?php esc_html_e( '- We can scan the database, find new fields, and create columns automatically', 'vg_sheet_editor' ); ?>
								<a class="wpse-scan-db-link" :href="vgse_editor_settings.scandb_url" data-wpse-tooltip="right"
									aria-label="<?php esc_attr_e( 'You can do this multiple times', 'vg_sheet_editor' ); ?>"><?php esc_html_e( 'Scan Now', 'vg_sheet_editor' ); ?></a>
							</li>

							<?php
							if ( class_exists( 'WP_Sheet_Editor_Custom_Columns' ) && VGSE()->helpers->is_editor_page() ) {
								?>
							<li><?php esc_html_e( '- If the previous solution failed, you can create new columns manually.', 'vg_sheet_editor' ); ?>
								<a class=""
									href="<?php echo esc_url( admin_url( 'admin.php?page=vg_sheet_editor_custom_columns' ) ); ?>"><?php esc_html_e( 'Create column', 'vg_sheet_editor' ); ?></a>
							</li>
							<?php } ?>
							<li><?php esc_html_e( '- Maybe you deleted the columns from the list.', 'vg_sheet_editor' ); ?> <a
									class="vgse-restore-removed-columns"
									href="#" @click.prevent="restoreDeletedColumns"><?php esc_html_e( 'Restore deleted columns', 'vg_sheet_editor' ); ?></a>
							</li>
							<li><?php esc_html_e( '- We can help you.', 'vg_sheet_editor' ); ?> <a class="" target="_blank"
									href="<?php echo esc_url( VGSE()->get_support_links( 'contact_us', 'url', 'sheet-missing-column' ) ); ?>"><?php esc_html_e( 'Contact us', 'vg_sheet_editor' ); ?></a>
							</li>
						</ul>
					</template>					
							</div>
				<?php } ?>
				</li>
				<li class="vgse-allow-save-settings">
					<label><input type="checkbox" value="yes" x-model="saveChangesInServer" />
						<?php esc_html_e( 'Save these settings for future sessions?', 'vg_sheet_editor' ); ?> <a href="#"
							data-wpse-tooltip="right"
							aria-label="If you enable this option, we will use these settings the next time you load the editor for this post type.">(
							? )</a></label>

				</li>

				<?php do_action( 'vg_sheet_editor/columns_visibility/after_fields', $post_type ); ?>

			</ul>
			<?php if ( ! $partial_form ) { ?>
			<div class="vgse-save-settings">
				<button type="submit"
					class="remodal-confirm"><?php esc_html_e( 'Apply settings', 'vg_sheet_editor' ); ?></button>
				<button data-remodal-action="confirm"
					class="remodal-cancel"><?php esc_html_e( 'Close', 'vg_sheet_editor' ); ?></button>
				
			</div>
			<?php } ?>
			<input type="hidden" value="yes" name="vgse_columns_manager_form">
			<?php if ( ! $partial_form ) { ?>
			<input type="hidden" value="vgse_update_columns_visibility" name="action">
			<input type="hidden" value="<?php echo esc_attr( $post_type ); ?>" name="post_type">
			<?php } ?>
			<input type="hidden" value="<?php echo esc_attr( $post_type ); ?>" name="wpsecv_post_type">
			<input type="hidden" value="" name="wpse_auto_reload_after_saving">

			<?php if ( ! $partial_form ) { ?>
		</form>
		<?php } ?>
	</div>
	<br>
</div>
