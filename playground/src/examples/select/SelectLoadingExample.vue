<script setup lang="ts">
import { ref } from 'vue'
import { TSelect } from 't-components'

const userId = ref<string | number | null>(null)

const users = [{"id":1,"name":"Atlanta Brompton"},
{"id":2,"name":"Kristal Gelder"},
{"id":3,"name":"Pandora Enterlein"},
{"id":4,"name":"Millisent Colten"},
{"id":5,"name":"Jodie Strooband"},
{"id":6,"name":"Lynelle Fabler"},
{"id":7,"name":"Walden Ogers"},
{"id":8,"name":"Oralia Crate"},
{"id":9,"name":"Chelsea Cullip"},
{"id":10,"name":"Kale Gerwood"},
{"id":11,"name":"Rem Stranieri"},
{"id":12,"name":"Myrtie Doumic"},
{"id":13,"name":"Daisie Blanning"},
{"id":14,"name":"Dougie Ickowicz"},
{"id":15,"name":"Veda Heinritz"},
{"id":16,"name":"Maddy Fitzmaurice"},
{"id":17,"name":"Daria Laundon"},
{"id":18,"name":"Kip Neath"},
{"id":19,"name":"Kip Critchlow"},
{"id":20,"name":"Kylila Ahren"},
{"id":21,"name":"Franz Blackledge"},
{"id":22,"name":"Mathian Riggeard"},
{"id":23,"name":"Elka De La Cote"},
{"id":24,"name":"Margarette Danniel"},
{"id":25,"name":"Antonio Broggelli"},
{"id":26,"name":"Josi Trude"},
{"id":27,"name":"Maurits Sotheby"},
{"id":28,"name":"Frans Juarez"},
{"id":29,"name":"Baxy Sheaber"},
{"id":30,"name":"Tammara Hargrove"},
{"id":31,"name":"Ronna Lyptrit"},
{"id":32,"name":"Sean Kunzelmann"},
{"id":33,"name":"Monte Balaizot"},
{"id":34,"name":"Gisela Hazelgrove"},
{"id":35,"name":"Charley Pfertner"},
{"id":36,"name":"Kathe Yetman"},
{"id":37,"name":"Sheela Auton"},
{"id":38,"name":"Helsa Caffery"},
{"id":39,"name":"Ailina Drew"},
{"id":40,"name":"Pat Borgne"},
{"id":41,"name":"Calley Rozalski"},
{"id":42,"name":"Corissa Otto"},
{"id":43,"name":"Eba Pardi"},
{"id":44,"name":"Thorny Impson"},
{"id":45,"name":"Tiffanie Tuffey"},
{"id":46,"name":"Orsa MacCulloch"},
{"id":47,"name":"Belia Gillebride"},
{"id":48,"name":"Lanni Pye"},
{"id":49,"name":"Earle Bushaway"},
{"id":50,"name":"Clemens Fouch"},
{"id":51,"name":"Rosemaria Poundsford"},
{"id":52,"name":"Marcelline Tondeur"},
{"id":53,"name":"Rory Deverille"},
{"id":54,"name":"Delano Dowyer"},
{"id":55,"name":"Griffie Egginson"},
{"id":56,"name":"Brigida Williams"},
{"id":57,"name":"Riccardo Habbijam"},
{"id":58,"name":"Valeda Gellan"},
{"id":59,"name":"Damiano McCory"},
{"id":60,"name":"Justina Charkham"},
{"id":61,"name":"Meridel Cosley"},
{"id":62,"name":"Nevins Tethcote"},
{"id":63,"name":"Cindee Slader"},
{"id":64,"name":"Harwell Zanettini"},
{"id":65,"name":"Carol-jean Gres"},
{"id":66,"name":"Raynell Clitsome"},
{"id":67,"name":"Farleigh Mushawe"},
{"id":68,"name":"Edin Bridgeland"},
{"id":69,"name":"Natalee Cuniffe"},
{"id":70,"name":"Shirleen Thomel"},
{"id":71,"name":"Crissy Pilmore"},
{"id":72,"name":"Ogdon Holde"},
{"id":73,"name":"Dominga Vonderdell"},
{"id":74,"name":"Natty Sivyer"},
{"id":75,"name":"Doralynn Haycock"},
{"id":76,"name":"Brad Wailes"},
{"id":77,"name":"Patty Senyard"},
{"id":78,"name":"Malia Maxweell"},
{"id":79,"name":"Cointon Bowley"},
{"id":80,"name":"Lilly Bathow"},
{"id":81,"name":"Joli Adel"},
{"id":82,"name":"Dwight Elphinstone"},
{"id":83,"name":"Colline Mattea"},
{"id":84,"name":"Pauline Gawen"},
{"id":85,"name":"Elliott Rotlauf"},
{"id":86,"name":"Lora Marcos"},
{"id":87,"name":"Fawnia Comber"},
{"id":88,"name":"Marinna Alday"},
{"id":89,"name":"Nelie Retchless"},
{"id":90,"name":"Elsy Estoile"},
{"id":91,"name":"Vivianna Tribe"},
{"id":92,"name":"Sisile Frosch"},
{"id":93,"name":"Jo Smalman"},
{"id":94,"name":"Merv Stoak"},
{"id":95,"name":"Noellyn Conen"},
{"id":96,"name":"Johannah Windybank"},
{"id":97,"name":"Darby Klain"},
{"id":98,"name":"Trix Cod"},
{"id":99,"name":"Eddie Roderigo"},
{"id":100,"name":"Pansy Ridge"}]

async function searchUsers(_query: string): Promise<any[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return users
    // .filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
    .map(u => ({ value: u.id, label: u.name }))
}
</script>

<template>
  <TSelect
    v-model="userId"
    searchable
    :loadOptions="searchUsers"
    :debounce="250"
    :minQueryLength="2"
    placeholder="Search users..."
    clearable
  />
</template>

<style scoped>
</style>
