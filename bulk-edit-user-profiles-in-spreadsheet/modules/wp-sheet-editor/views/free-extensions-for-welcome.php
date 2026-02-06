<?php defined( 'ABSPATH' ) || exit;
// The free extensions should appear only when using a free plugin
if ( VGSE_ANY_PREMIUM_ADDON ) {
	$free_extensions_html = '';
	return;
}
$sheets = wp_list_filter( VGSE()->helpers->get_prepared_post_types(), array( 'is_disabled' => true ) );
ob_start();
foreach ( $sheets as $sheet ) {
	if ( strpos( $sheet['description'], 'free' ) === false ) {
		continue;
	}
	?>

	<p>
	<?php
	// translators: 1: sheet name, 2: sheet description
	echo wp_kses_post( sprintf( esc_html__( 'Spreadsheet for %1$s %2$s', 'vg_sheet_editor' ), $sheet['label'], str_replace( array( '<small>', '</small>' ), '', $sheet['description'] ) ) );
	?>
	</p>
	<?php
}
$free_extensions      = ob_get_clean();
$free_extensions_html = '<p>' . esc_html__( 'Free extensions', 'vg_sheet_editor' ) . '</p>' . $free_extensions;
