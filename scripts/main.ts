import { world, system, Player, ItemStack, Block, EntityComponentTypes, EntityEquippableComponent, ItemComponentTypes, EquipmentSlot, ItemEnchantableComponent, ItemDurabilityComponent, Entity } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from '@minecraft/vanilla-data';
import { getEnchantableComponent, getDurabilityComponent, getEquippableComponent, damageRate, getPattern } from "./utility";

const isCreative = (player: Player) => player.runCommand("testfor @s[m=1]").successCount === 1

const durabilityDamage = (player: Player, item: ItemStack, damageTotal: number): void => {
	if (isCreative(player)) return;
	const level = getEnchantableComponent(item)?.getEnchantment(MinecraftEnchantmentTypes.Unbreaking)?.level;
	const damageTotalRemove = Math.ceil(damageTotal * damageRate(level));

  const durabilityComponent = getDurabilityComponent(item);
  if (durabilityComponent) {
    durabilityComponent.damage += damageTotalRemove;

    if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
      player.runCommand("replaceitem entity @s slot.weapon.mainhand 0 air")
      player.runCommand("playsound random.break @a[r=5] ~~~")
    }
  }
}

const breakBlocks = (block: Block, tool: ItemStack, minePattern: number[], player: Player): void => {
	let damageTotal = 0;
	let loc = block.location;
	for (let x = minePattern[0]; x < minePattern[3] + 1; x++) {
		for (let y = minePattern[1]; y < minePattern[4] + 1; y++) {
			for (let z = minePattern[2]; z < minePattern[5] + 1; z++) {
				const location = {
					x: loc.x + x,
					y: loc.y + y,
					z: loc.z + z
				};
				const blockForReplace = block.dimension.getBlock(location);
				if (!!blockForReplace && !blockForReplace.isAir && !blockForReplace.isLiquid) {
					const hasSilkTouch = getEnchantableComponent(tool).hasEnchantment(MinecraftEnchantmentTypes.SilkTouch);
					if (hasSilkTouch) {
						blockForReplace.dimension.spawnItem(new ItemStack(blockForReplace?.typeId, 1), location);
						blockForReplace.dimension.runCommand(`setblock ${location.x} ${location.y} ${location.z} air`);
					} else {
						blockForReplace.dimension.runCommand(`fill ${location.x} ${location.y} ${location.z} ${location.x} ${location.y} ${location.z} air destroy`);
					}
					damageTotal++
				}
			}
		}
	}
	player.runCommand(`playsound dig.stone @a[r=5] ~~~`)
	durabilityDamage(player, tool, damageTotal)
}

world.beforeEvents.playerBreakBlock.subscribe(({player, block}) => {
  system.run(() => {
    const tool = getEquippableComponent(player).getEquipment(EquipmentSlot.Mainhand);
    if (!tool?.typeId?.startsWith("ut:")) return;

    if (player.isSneaking) {
      return breakBlocks(block, tool, getPattern(player, 0), player)
    }
  });
});

world.afterEvents.itemUseOn.subscribe(({source, block}) => {
  const tool = getEquippableComponent(source).getEquipment(EquipmentSlot.Mainhand);
  if (!tool?.typeId?.startsWith("ut:")) return;

  if (block) {
    breakBlocks(block, tool, getPattern(source, 3), source)
  }
});