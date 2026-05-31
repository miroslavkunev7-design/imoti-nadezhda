# burgas-COMPLETE — изходни файлове (без промяна)

Поставете съдържанието от `burgas-COMPLETE (2).zip` **директно** в подпапките:

| Страница | URL | Папка |
|----------|-----|--------|
| 1. Град Бургас | `/cities/burgas` | `city/` |
| 2. Квартал (напр. Лазур) | `/cities/burgas/lazur` | `quarter/` |
| 3. Детайл имот | `/cities/burgas/lazur/property/900001` | `property/` |

Сега в репото са копия от git (докато zip не е качен в workspace):

- `city/` — commit `81ac8f8` (CityBurgasView + CSS + MarbleQuarterCard)
- `quarter/` — commit `bc15a48` (QuarterBurgasPage) + CSS копие от city
- `property/` — commit `bc15a48` (PropertyDetailScreen) + `property-detail.css` в app

**Демо имот за преглед на детайла:** `data/local-properties.json` → id `900001`
