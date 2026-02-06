<?php

defined( 'ABSPATH' ) || exit;
$users_obj = vgse_users();
?>

	<h2><?php 
esc_html_e( 'Go premium', $users_obj->textname );
?></h2>
	<ul>
		<li><?php 
esc_html_e( 'Edit Customers billing and shipping info.', $users_obj->textname );
?></li>
		<li><?php 
esc_html_e( 'Update hundreds of user profiles using formulas', $users_obj->textname );
?></li>
		<li><?php 
esc_html_e( 'Advanced search. Find user profiles quickly.', $users_obj->textname );
?></li>
		<li><?php 
esc_html_e( 'Create a lot of users quickly.', $users_obj->textname );
?></li>
		<li><?php 
esc_html_e( 'Edit custom fields from user profiles, including passwords', $users_obj->textname );
?></li>
		<li><?php 
printf( esc_html__( 'Edit users with any role, including %s.', $users_obj->textname ), esc_html( implode( ', ', wp_list_pluck( get_editable_roles(), 'name' ) ) ) );
?></li>
		<li><?php 
esc_html_e( 'Hide and rename columns in the spreadsheet', $users_obj->textname );
?></li>
	</ul>
	<?php 
add_action( 'vg_plugin_sdk/welcome-page/after_upgrade_button', 'wpseu_after_upgrade_button' );
function wpseu_after_upgrade_button() {
    ?>		
		<p><b><?php 
    esc_html_e( 'Money back guarantee.', 'vg_sheet_editor' );
    ?></b> <?php 
    esc_html_e( 'We\'ll give you a refund if the plugin doesn\'t work.', 'vg_sheet_editor' );
    ?></p>
		<?php 
}
