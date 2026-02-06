<?php
global $wpdb;
defined( 'ABSPATH' ) || exit;
if ( ! isset( $custom_post_types_raw ) ) {
	$custom_post_types_raw = array();
}

$all_sheets         = VGSE()->helpers->get_prepared_post_types();
$enabled_post_types = VGSE()->helpers->get_enabled_post_types();

$prefix            = $wpdb->prefix;
$trimmed_prefix    = rtrim( $prefix, '_' );
$underscore_count  = substr_count( $trimmed_prefix, '_' );
$words_to_group_by = ( $underscore_count === 1 ) ? 3 : 2;

// Groups the sheets
$groups_raw  = array();
$singles_raw = array();
foreach ( $all_sheets as $sheet ) {
	$limit       = $words_to_group_by + 1;
	$label_words = explode( ' ', trim( $sheet['label'] ), $limit );

	if ( count( $label_words ) > $words_to_group_by ) {
		$key_words                  = array_slice( $label_words, 0, $words_to_group_by );
		$group_key                  = implode( ' ', $key_words );
		$groups_raw[ $group_key ][] = $sheet;
	} else {
		$singles_raw[] = $sheet;
	}
}

foreach ( $groups_raw as $key => $grouped_sheets ) {
	if ( count( $grouped_sheets ) < 2 ) {
		$singles_raw = array_merge( $singles_raw, $grouped_sheets );
		unset( $groups_raw[ $key ] );
	}
}

if ( ! function_exists( 'vgse_format_sheet_for_js' ) ) {
	function vgse_format_sheet_for_js( $sheet, $enabled_post_types, $custom_post_types_raw ) {
		$key = $sheet['key'];
		return array(
			'key'         => $key,
			'label'       => wp_kses_post( $sheet['label'] ),
			'description' => wp_kses_post( $sheet['description'] ),
			'isDisabled'  => ! empty( $sheet['is_disabled'] ),
			'isChecked'   => in_array( $key, $enabled_post_types ),
			'canDelete'   => ! empty( $custom_post_types_raw ) && in_array( $key, $custom_post_types_raw, true ) && VGSE()->helpers->user_can_manage_options() && post_type_exists( $key ),
		);
	}
}

$final_groups = array();
foreach ( $groups_raw as $name => $sheets ) {
	$processed_sheets = array();
	foreach ( $sheets as $sheet ) {
		$processed_sheets[] = vgse_format_sheet_for_js( $sheet, $enabled_post_types, $custom_post_types_raw );
	}
	$final_groups[ 'group-' . sanitize_title( $name ) ] = array(
		'id'     => 'group-' . sanitize_title( $name ),
		'name'   => $name,
		'sheets' => $processed_sheets,
	);
}

$final_singles = array();
foreach ( $singles_raw as $sheet ) {
	$final_singles[] = vgse_format_sheet_for_js( $sheet, $enabled_post_types, $custom_post_types_raw );
}

$alpine_data = array(
	'groups'  => array_values( $final_groups ),
	'singles' => $final_singles,
);

?>
<style>
	.vgse-post-type-group-header { padding: 5px; cursor: pointer; border-radius: 3px; margin-top: 5px; display: flex; align-items: center; gap: 5px; }
	.vgse-post-type-group-header:hover { background-color: #f0f0f1; }
	.vgse-post-type-group-items { margin-left: 24px; border-left: 1px solid #ddd; padding-left: 10px; }
</style>

<form action="<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>" method="POST" class="post-types-form" x-data="sheetsForm(availableSheetsData)">

	<p><?php esc_html_e( 'Available spreadsheets', 'vg_sheet_editor' ); ?></p>
	<?php if ( class_exists( 'WPSE_CSV_API' ) && count( $all_sheets ) > 5 ) : ?>
	<div class="filter-sheets">
		<input type="search" name="sheets_search" x-model="searchTerm" placeholder="Search sheet by name...">
	</div>
	<?php endif; ?>

	<template x-for="sheet in filteredSingles" :key="sheet.key">
		<div class="post-type-field" :class="`post-type-${sheet.key}`">
			<input type="checkbox" name="post_types[]" :value="sheet.key" :id="sheet.key" :disabled="sheet.isDisabled" :checked="sheet.isChecked">
			<label :for="sheet.key"><span x-html="sheet.label"></span> <span x-html="sheet.description"></span></label>
			<template x-if="sheet.canDelete">
				<button class="button vgse-delete-post-type" :data-post-type="sheet.key"><i class="fa fa-remove"></i></button>
			</template>
		</div>
	</template>

	<template x-for="group in filteredGroups" :key="group.id">
		<div class="vgse-post-type-group">
			<div class="vgse-post-type-group-header" @click="toggleGroup(group.id)">
				<span class="dashicons" :class="getArrowClass(group.id)"></span>
				<label class="group-name"><b x-text="`${group.name} (${group.sheets.length})`"></b></label>
			</div>
			<div class="vgse-post-type-group-items" x-show="isGroupOpen(group.id)" x-transition.opacity.duration.200ms>
				<template x-for="sheet in group.sheets" :key="sheet.key">
					<div class="post-type-field" :class="`post-type-${sheet.key}`">
						<input type="checkbox" name="post_types[]" :value="sheet.key" :id="sheet.key" :disabled="sheet.isDisabled" :checked="sheet.isChecked">
						<label :for="sheet.key"><span x-html="sheet.label"></span> <span x-html="sheet.description"></span></label>
						<template x-if="sheet.canDelete">
							<button class="button vgse-delete-post-type" :data-post-type="sheet.key"><i class="fa fa-remove"></i></button>
						</template>
					</div>
				</template>
			</div>
		</div>
	</template>


	<input type="hidden" name="action" value="vgse_save_post_types_setting">
	<input type="hidden" name="append" value="no">
	<input type="hidden" name="nonce" value="<?php echo esc_attr( wp_create_nonce( 'bep-nonce' ) ); ?>">
	<button class="button button-primary hidden save-trigger button-primary"><?php esc_html_e( 'Save', 'vg_sheet_editor' ); ?></button>
</form>

<script>
const availableSheetsData = <?php echo wp_json_encode( $alpine_data ); ?>;

document.addEventListener('alpine:init', () => {
	Alpine.data('sheetsForm', (initialData) => ({
		searchTerm: '',
		openGroups: {},
		groups: initialData.groups || [],
		singles: initialData.singles || [],

		// This init function runs when the component is initialized.
		init() {
			// Find the WordPress admin menu element. Use optional chaining (?.) for safety.
			const menuHtml = document.getElementById('toplevel_page_vg_sheet_editor_setup')?.innerHTML || '';

			// If the menu element doesn't exist, do nothing.
			if (!menuHtml) {
				return;
			}
			
			// Function to check and update a sheet's disabled status
			const updateSheetStatus = (sheet) => {
				// This is the same logic from the original jQuery code.
				// If the sheet is disabled AND its "bulk-edit" link exists in the admin menu, enable it.
				if (sheet.isDisabled && menuHtml.includes('bulk-edit-' + sheet.key)) {
					sheet.isDisabled = false; // Directly update the state. Alpine will update the checkbox.
				}
			};

			// Loop through all single sheets and apply the logic.
			this.singles.forEach(updateSheetStatus);

			// Loop through all grouped sheets and apply the logic.
			this.groups.forEach(group => group.sheets.forEach(updateSheetStatus));
		},

		get filteredSingles() {
			if (!this.searchTerm.trim()) return this.singles;
			const search = this.searchTerm.toLowerCase();
			return this.singles.filter(s => s.label.toLowerCase().includes(search));
		},
		get filteredGroups() {
			if (!this.searchTerm.trim()) return this.groups;
			const search = this.searchTerm.toLowerCase();
			return this.groups.filter(g => 
				g.name.toLowerCase().includes(search) || 
				g.sheets.some(s => s.label.toLowerCase().includes(search))
			);
		},

		toggleGroup(groupId) {
			this.openGroups[groupId] = !this.openGroups[groupId];
		},
		isGroupOpen(groupId) {
			return !!this.openGroups[groupId];
		},
		getArrowClass(groupId) {
			return this.isGroupOpen(groupId) ? 'dashicons-arrow-down-alt2' : 'dashicons-arrow-right-alt2';
		}
	}));
});
</script>
