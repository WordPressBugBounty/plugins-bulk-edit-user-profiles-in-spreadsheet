<?php

defined( 'ABSPATH' ) || exit;
$users_obj = vgse_users();
?>

	<h2><?php 
_e( 'Go premium', $users_obj->textname );
?></h2>
	<ul>
		<li><?php 
_e( 'Edit Customers billing and shipping info.', $users_obj->textname );
?></li>
		<li><?php 
_e( 'Update hundreds of user profiles using formulas', $users_obj->textname );
?></li>
		<li><?php 
_e( 'Advanced search. Find user profiles quickly.', $users_obj->textname );
?></li>
		<li><?php 
_e( 'Create a lot of users quickly.', $users_obj->textname );
?></li>
		<li><?php 
_e( 'Edit custom fields from user profiles, including passwords', $users_obj->textname );
?></li>
		<li><?php 
printf( __( 'Edit users with any role, including %s.', $users_obj->textname ), esc_html( implode( ', ', wp_list_pluck( get_editable_roles(), 'name' ) ) ) );
?></li>
		<li><?php 
_e( 'Hide and rename columns in the spreadsheet', $users_obj->textname );
?></li>
	</ul>
	<?php 
add_action( 'vg_plugin_sdk/welcome-page/after_upgrade_button', 'wpseu_after_upgrade_button' );
function wpseu_after_upgrade_button() {
    $users_obj = vgse_users();
    ?>
		<?php 
    _e( '<p><b>Money back guarantee.</b> We´ll give you a refund if the plugin doesn´t work.</p>', $users_obj->textname );
    ?>
		<?php 
}
