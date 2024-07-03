import { Player, ItemStack, EntityComponentTypes, EntityEquippableComponent, ItemComponentTypes, ItemEnchantableComponent, ItemDurabilityComponent } from "@minecraft/server";

export const getEnchantableComponent = (item: ItemStack): ItemEnchantableComponent => {
  return <ItemEnchantableComponent>item.getComponent(ItemComponentTypes.Enchantable);
}

export const getDurabilityComponent = (item: ItemStack): ItemDurabilityComponent => {
  return <ItemDurabilityComponent>item.getComponent(ItemComponentTypes.Durability);
}

export const getEquippableComponent = (player: Player): EntityEquippableComponent => {
  return <EntityEquippableComponent>player.getComponent(EntityComponentTypes.Equippable);
}

export const getPattern = (player: Player, range: number): number[] =>  {
	const direction = player?.getBlockFromViewDirection()?.face.toLowerCase()
	switch (direction) {
		case "north":	return [-1, -1,  0, 1, 1, range];
		case "south":	return [-1, -1,  0 - range, 1, 1, 0];
		case "west":	return [ 0, -1, -1, range, 1, 1];
		case "east":	return [ 0 - range, -1, -1, 0, 1, 1];
		case "down":	return [-1,  0, -1, 1, range, 1];
		case "up":		return [-1,  0 - range, -1, 1, 0, 1];
    default: return [];
	}
};

export const damageRate = (level: number | undefined): number => {
	switch(level) {
		case undefined: return 0.1;
		case 1: return 0.5;
		case 2: return 0.33;
		case 3: return 0.25;
		default: return 1;
	}
}