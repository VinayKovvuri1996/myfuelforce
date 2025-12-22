export interface Mandal {
    name: string;
}

export interface District {
    name: string;
    mandals: Mandal[];
}

export interface State {
    name: string;
    districts: District[];
}

export const INDIA_DATA: State[] = [
    {
        name: 'Telangana',
        districts: [
            {
                name: 'Adilabad',
                mandals: [
                    { name: 'Adilabad Urban' }, { name: 'Adilabad Rural' }, { name: 'Mavala' }, { name: 'Gudihatnoor' }, { name: 'Bazarhatnoor' },
                    { name: 'Bela' }, { name: 'Bheempur' }, { name: 'Jainad' }, { name: 'Talamadugu' }, { name: 'Tamsi' },
                    { name: 'Boath' }, { name: 'Gudiguda' }, { name: 'Ichoda' }, { name: 'Neradigonda' }, { name: 'Sirikonda' },
                    { name: 'Indervelly' }, { name: 'Narnoor' }, { name: 'Utnoor' }
                ]
            },
            {
                name: 'Bhadradri Kothagudem',
                mandals: [
                    { name: 'Kothagudem' }, { name: 'Palwancha' }, { name: 'Tekulapally' }, { name: 'Yellandu' }, { name: 'Chandrugonda' },
                    { name: 'Aswaraopeta' }, { name: 'Dammapeta' }, { name: 'Mulakalapally' }, { name: 'Annapureddypally' }, { name: 'Julurpad' },
                    { name: 'Sujatanagar' }, { name: 'Chunchupally' }, { name: 'Laxmidevipally' }, { name: 'Allapally' }, { name: 'Gundala' },
                    { name: 'Karakagudem' }, { name: 'Manuguru' }, { name: 'Pinapaka' }, { name: 'Aswapuram' }, { name: 'Burgampahad' },
                    { name: 'Bhadrachalam' }, { name: 'Cherla' }, { name: 'Dummugudem' }
                ]
            },
            {
                name: 'Hanumakonda',
                mandals: [
                    { name: 'Hanumakonda' }, { name: 'Kazipet' }, { name: 'Dharmasagar' }, { name: 'Hasanparthy' }, { name: 'Inavolu' },
                    { name: 'Velair' }, { name: 'Bheemadevarapally' }, { name: 'Elkathurthy' }, { name: 'Kamalapur' }, { name: 'Parkal' },
                    { name: 'Nadikuda' }, { name: 'Damera' }, { name: 'Atmakur' }, { name: 'Shayampet' }
                ]
            },
            {
                name: 'Hyderabad',
                mandals: [
                    { name: 'Amberpet' }, { name: 'Asifnagar' }, { name: 'Bahadurpura' }, { name: 'Bandlaguda' }, { name: 'Charminar' },
                    { name: 'Golconda' }, { name: 'Himayathnagar' }, { name: 'Khairatabad' }, { name: 'Marredpally' }, { name: 'Musheerabad' },
                    { name: 'Nampally' }, { name: 'Saidabad' }, { name: 'Secunderabad' }, { name: 'Shaikpet' }, { name: 'Tirumalagiri' },
                    { name: 'Ameerpet' }
                ]
            },
            {
                name: 'Jagtial',
                mandals: [
                    { name: 'Jagtial' }, { name: 'Jagtial Rural' }, { name: 'Raikal' }, { name: 'Sarangapur' }, { name: 'Beerpur' },
                    { name: 'Dharmapuri' }, { name: 'Buggaram' }, { name: 'Pegadapally' }, { name: 'Gollapally' }, { name: 'Mallial' },
                    { name: 'Kodimial' }, { name: 'Velgatoor' }, { name: 'Korutla' }, { name: 'Metpalli' }, { name: 'Mallapur' },
                    { name: 'Ibrahimpatnam' }, { name: 'Medipalli' }, { name: 'Kathlapur' }
                ]
            },
            {
                name: 'Jangaon',
                mandals: [
                    { name: 'Jangaon' }, { name: 'Lingala Ghanpur' }, { name: 'Bachannapet' }, { name: 'Devaruppula' }, { name: 'Narmetta' },
                    { name: 'Tharigoppula' }, { name: 'Raghunathpalle' }, { name: 'Ghanpur (Station)' }, { name: 'Chilpur' }, { name: 'Zaffergadh' },
                    { name: 'Palakurthi' }, { name: 'Kodakandla' }
                ]
            },
            {
                name: 'Jayashankar Bhupalpally',
                mandals: [
                    { name: 'Bhupalpally' }, { name: 'Ghanpur (Mulug)' }, { name: 'Regonda' }, { name: 'Mogullapally' }, { name: 'Chityal' },
                    { name: 'Tekumatla' }, { name: 'Malharrao' }, { name: 'Kataram' }, { name: 'Mahadevpur' }, { name: 'Palimela' },
                    { name: 'Mutharam' }
                ]
            },
            {
                name: 'Jogulamba Gadwal',
                mandals: [
                    { name: 'Gadwal' }, { name: 'Dharur' }, { name: 'Gattu' }, { name: 'Kt. Doddi' }, { name: 'Maldakal' },
                    { name: 'Ieeja' }, { name: 'Itikyal' }, { name: 'Manopad' }, { name: 'Waddepalle' }, { name: 'Rajoli' },
                    { name: 'Alampur' }, { name: 'Undavelli' }
                ]
            },
            {
                name: 'Kamareddy',
                mandals: [
                    { name: 'Kamareddy' }, { name: 'Bhiknoor' }, { name: 'Rajampet' }, { name: 'Domakonda' }, { name: 'Bibipet' },
                    { name: 'Machareddy' }, { name: 'Ramareddy' }, { name: 'Sadasivanagar' }, { name: 'Tadwai' }, { name: 'Gandhari' },
                    { name: 'Lingampet' }, { name: 'Naga Reddipet' }, { name: 'Yellareddy' }, { name: 'Banswada' }, { name: 'Birkoor' },
                    { name: 'Bichkunda' }, { name: 'Jukkal' }, { name: 'Madnoor' }, { name: 'Nizamsagar' }, { name: 'Pitlam' },
                    { name: 'Nasrullabad' }, { name: 'Pedda Kodapgal' }
                ]
            },
            {
                name: 'Karimnagar',
                mandals: [
                    { name: 'Karimnagar' }, { name: 'Karimnagar Rural' }, { name: 'Manakondur' }, { name: 'Timmapur' }, { name: 'Ganneruvaram' },
                    { name: 'Gangadhara' }, { name: 'Ramadugu' }, { name: 'Choppadandi' }, { name: 'Chigurumamidi' }, { name: 'Veenavanka' },
                    { name: 'V. Saidapur' }, { name: 'Shankarapatnam' }, { name: 'Huzurabad' }, { name: 'Jammikunta' }, { name: 'Ellandakunta' },
                    { name: 'Kothapally' }
                ]
            },
            {
                name: 'Khammam',
                mandals: [
                    { name: 'Khammam (Urban)' }, { name: 'Khammam (Rural)' }, { name: 'Thirumalayapalem' }, { name: 'Kusumanchi' }, { name: 'Bonakal' },
                    { name: 'Chinthakani' }, { name: 'Mudigonda' }, { name: 'Konijerla' }, { name: 'Singareni' }, { name: 'Enkoor' },
                    { name: 'Kamepally' }, { name: 'Raghunathapalem' }, { name: 'Sathupally' }, { name: 'Vemsoor' }, { name: 'Kalluru' },
                    { name: 'Thallada' }, { name: 'Penuballi' }, { name: 'Wyra' }, { name: 'Madhira' }, { name: 'Yerrupalem' },
                    { name: 'Nelakondapally' }
                ]
            },
            {
                name: 'Kumuram Bheem Asifabad',
                mandals: [
                    { name: 'Asifabad' }, { name: 'Kagaznagar' }, { name: 'Rebbena' }, { name: 'Wankidi' }, { name: 'Kerameri' },
                    { name: 'Jainoor' }, { name: 'Sirpur (U)' }, { name: 'Lingapur' }, { name: 'Tiryani' }, { name: 'Dahegaon' },
                    { name: 'Penchikalpet' }, { name: 'Bejjur' }, { name: 'Koutala' }, { name: 'Chintalamanepally' }, { name: 'Sirpur (T)' }
                ]
            },
            {
                name: 'Mahabubabad',
                mandals: [
                    { name: 'Mahabubabad' }, { name: 'Kuravi' }, { name: 'Kesamudram' }, { name: 'Dornakal' }, { name: 'Gudur' },
                    { name: 'Kothaguda' }, { name: 'Gangaram' }, { name: 'Bayyaram' }, { name: 'Garla' }, { name: 'Chinnagudur' },
                    { name: 'Danthalapally' }, { name: 'Nellikudur' }, { name: 'Maripeda' }, { name: 'Narsimhulapet' }, { name: 'Thorrur' },
                    { name: 'Peddavangara' }
                ]
            },
            {
                name: 'Mahabubnagar',
                mandals: [
                    { name: 'Mahabubnagar Urban' }, { name: 'Mahabubnagar Rural' }, { name: 'Jadcherla' }, { name: 'Bhoothpur' }, { name: 'Hanwada' },
                    { name: 'Koilkonda' }, { name: 'Nawabpet' }, { name: 'Balanagar' }, { name: 'Rajapur' }, { name: 'Gandeed' },
                    { name: 'Devarakadra' }, { name: 'Addakal' }, { name: 'Midjil' }, { name: 'Musaipet' }, { name: 'Chinnachintakunta' }
                ]
            },
            {
                name: 'Mancherial',
                mandals: [
                    { name: 'Mancherial' }, { name: 'Naspur' }, { name: 'Hajipur' }, { name: 'Luxettipet' }, { name: 'Dandepally' },
                    { name: 'Jannaram' }, { name: 'Thandur' }, { name: 'Bellampally' }, { name: 'Vemanpally' }, { name: 'Nennel' },
                    { name: 'Kannepally' }, { name: 'Bheemini' }, { name: 'Kasipet' }, { name: 'Mandamarri' }, { name: 'Kotapally' },
                    { name: 'Chennur' }, { name: 'Jaipur' }, { name: 'Bheemaram' }
                ]
            },
            {
                name: 'Medak',
                mandals: [
                    { name: 'Medak' }, { name: 'Haveli Ghanpur' }, { name: 'Papannapet' }, { name: 'Ramayampet' }, { name: 'Nizampet' },
                    { name: 'Shankarampet (R)' }, { name: 'Shankarampet (A)' }, { name: 'Tekmal' }, { name: 'Alladurg' }, { name: 'Regode' },
                    { name: 'Narsapur' }, { name: 'Kulcharam' }, { name: 'Chilipched' }, { name: 'Shivampet' }, { name: 'Kowdipally' },
                    { name: 'Tupran' }, { name: 'Manoharabad' }, { name: 'Chegunta' }, { name: 'Narsingi' }, { name: 'Yeldurthy' }
                ]
            },
            {
                name: 'Medchal-Malkajgiri',
                mandals: [
                    { name: 'Alwal' }, { name: 'Bachupally' }, { name: 'Balanagar' }, { name: 'Dundigal Gandimaisamma' },
                    { name: 'Ghatkesar' }, { name: 'Kapra' }, { name: 'Keesara' }, { name: 'Kukatpally' },
                    { name: 'Malkajgiri' }, { name: 'Medchal' }, { name: 'Medipally' }, { name: 'Quthbullapur' },
                    { name: 'Shamirpet' }, { name: 'Uppal' }, { name: 'Muduchintalapally' }
                ]
            },
            {
                name: 'Mulugu',
                mandals: [
                    { name: 'Mulugu' }, { name: 'Venkatapur' }, { name: 'Govindaraopet' }, { name: 'SS Tadwai' }, { name: 'Eturunagaram' },
                    { name: 'Kannaigudem' }, { name: 'Mangapet' }, { name: 'Wazeed' }, { name: 'Venkatapuram' }
                ]
            },
            {
                name: 'Nagarkurnool',
                mandals: [
                    { name: 'Nagarkurnool' }, { name: 'Bijinapally' }, { name: 'Telkapally' }, { name: 'Thimmajipet' }, { name: 'Tadoor' },
                    { name: 'Achampet' }, { name: 'Amrabad' }, { name: 'Padra' }, { name: 'Balmoor' }, { name: 'Lingal' },
                    { name: 'Uppununthala' }, { name: 'Vangoor' }, { name: 'Kalwakurthy' }, { name: 'Urkonda' }, { name: 'Charakonda' },
                    { name: 'Veldanda' }, { name: 'Kollapur' }, { name: 'Kodair' }, { name: 'Pentlavelli' }, { name: 'Peddakothapally' }
                ]
            },
            {
                name: 'Nalgonda',
                mandals: [
                    { name: 'Nalgonda' }, { name: 'Nalgonda Rural' }, { name: 'Tipparthi' }, { name: 'Kanagal' }, { name: 'Madugulapally' },
                    { name: 'Miryalaguda' }, { name: 'Dameracherla' }, { name: 'Adavidevulapally' }, { name: 'Vemulapally' }, { name: 'Tripuraram' },
                    { name: 'Nidmanoor' }, { name: 'Peddavoora' }, { name: 'Anumula' }, { name: 'Thirumalagiri (Sagar)' }, { name: 'Chityal' },
                    { name: 'Narketpally' }, { name: 'Kattangur' }, { name: 'Nakrekal' }, { name: 'Kethepally' }, { name: 'Shaligouraram' },
                    { name: 'Chandur' }, { name: 'Gattuppal' }, { name: 'Munugode' }, { name: 'Nampally' }, { name: 'Marriguda' },
                    { name: 'Devarakonda' }, { name: 'Kondamallepally' }, { name: 'P.A. Pally' }, { name: 'Gundlapally' }, { name: 'Chandampet' },
                    { name: 'Neredugommu' }
                ]
            },
            {
                name: 'Narayanpet',
                mandals: [
                    { name: 'Narayanpet' }, { name: 'Damaragidda' }, { name: 'Dhanwada' }, { name: 'Marikal' }, { name: 'Kosgi' },
                    { name: 'Maddur' }, { name: 'Utkoor' }, { name: 'Maganoor' }, { name: 'Makthal' }, { name: 'Krishna' },
                    { name: 'Narva' }
                ]
            },
            {
                name: 'Nirmal',
                mandals: [
                    { name: 'Nirmal' }, { name: 'Nirmal Rural' }, { name: 'Soan' }, { name: 'Dilawarpur' }, { name: 'Narsapur (G)' },
                    { name: 'Kaddam' }, { name: 'Dasturabad' }, { name: 'Khanapur' }, { name: 'Mamda' }, { name: 'Laxmanchanda' },
                    { name: 'Sarangapur' }, { name: 'Kuntala' }, { name: 'Kubeer' }, { name: 'Bhainsa' }, { name: 'Mudhole' },
                    { name: 'Basar' }, { name: 'Lokeswaram' }, { name: 'Tanur' }
                ]
            },
            {
                name: 'Nizamabad',
                mandals: [
                    { name: 'Nizamabad North' }, { name: 'Nizamabad South' }, { name: 'Nizamabad Rural' }, { name: 'Dichpally' }, { name: 'Dharpally' },
                    { name: 'Indalwai' }, { name: 'Jakranpally' }, { name: 'Sirikonda' }, { name: 'Armoor' }, { name: 'Nandipet' },
                    { name: 'Makloor' }, { name: 'Balkonda' }, { name: 'Mupkal' }, { name: 'Morthad' }, { name: 'Kammarpally' },
                    { name: 'Yergatla' }, { name: 'Bheemgal' }, { name: 'Varni' }, { name: 'Rudrur' }, { name: 'Kotagiri' },
                    { name: 'Potangal' }, { name: 'Bodhan' }, { name: 'Renjal' }, { name: 'Yedapally' }, { name: 'Navipet' },
                    { name: 'Mugpal' }, { name: 'Chandur' }, { name: 'Mosra' }
                ]
            },
            {
                name: 'Peddapalli',
                mandals: [
                    { name: 'Peddapalli' }, { name: 'Odela' }, { name: 'Sultanabad' }, { name: 'Julapalli' }, { name: 'Eligaid' },
                    { name: 'Dharmaram' }, { name: 'Ramagundam' }, { name: 'Antargaon' }, { name: 'Palakurthy' }, { name: 'Kamanpur' },
                    { name: 'Manthani' }, { name: 'Mutharam (Manthani)' }, { name: 'Ramagiri' }, { name: 'Srirampur' }
                ]
            },
            {
                name: 'Rajanna Sircilla',
                mandals: [
                    { name: 'Sircilla' }, { name: 'Thangallapalli' }, { name: 'Gambhiraopet' }, { name: 'Mustabad' }, { name: 'Yellareddypet' },
                    { name: 'Veernapalli' }, { name: 'Vemulawada' }, { name: 'Vemulawada Rural' }, { name: 'Konaraopet' }, { name: 'Chandurthi' },
                    { name: 'Rudrangi' }, { name: 'Boinpalli' }, { name: 'Illanthakunta' }
                ]
            },
            {
                name: 'Ranga Reddy',
                mandals: [
                    { name: 'Abdullapurmet' }, { name: 'Amangal' }, { name: 'Balapur' }, { name: 'Chevella' },
                    { name: 'Gandipet' }, { name: 'Hayathnagar' }, { name: 'Ibrahimpatnam' }, { name: 'Kandukur' },
                    { name: 'Maheshwaram' }, { name: 'Manchal' }, { name: 'Moinabad' }, { name: 'Rajendranagar' },
                    { name: 'Saroornagar' }, { name: 'Serilingampally' }, { name: 'Shabad' }, { name: 'Shamshabad' },
                    { name: 'Shankarpally' }, { name: 'Talakondapally' }, { name: 'Yacharam' }, { name: 'Madgul' },
                    { name: 'Kadthal' }, { name: 'Farooqnagar' }, { name: 'Kothur' }, { name: 'Nandigama' },
                    { name: 'Chowdergudem' }
                ]
            },
            {
                name: 'Sangareddy',
                mandals: [
                    { name: 'Sangareddy' }, { name: 'Kandi' }, { name: 'Kondapur' }, { name: 'Sadasivpet' }, { name: 'Patancheru' },
                    { name: 'Ameenpur' }, { name: 'Ramchandrapuram' }, { name: 'Jinnaram' }, { name: 'Gummadidala' }, { name: 'Pulkal' },
                    { name: 'Munipally' }, { name: 'Andole' }, { name: 'Watpally' }, { name: 'Hathnoora' }, { name: 'Zaheerabad' },
                    { name: 'Mogudampally' }, { name: 'Nyalkal' }, { name: 'Jharasangam' }, { name: 'Kohir' }, { name: 'Raikode' },
                    { name: 'Narayankhed' }, { name: 'Kangti' }, { name: 'Kalher' }, { name: 'Sirgapoor' }, { name: 'Manakoor' },
                    { name: 'Nagalgidda' }
                ]
            },
            {
                name: 'Siddipet',
                mandals: [
                    { name: 'Siddipet Urban' }, { name: 'Siddipet Rural' }, { name: 'Nangnoor' }, { name: 'Chinnakodur' }, { name: 'Thoguta' },
                    { name: 'Doultabad' }, { name: 'Mirdoddi' }, { name: 'Dubbak' }, { name: 'Chegunta' }, { name: 'Komuravelli' },
                    { name: 'Cherial' }, { name: 'Maddur' }, { name: 'Husnabad' }, { name: 'Akkannapet' }, { name: 'Koheda' },
                    { name: 'Bejjanki' }, { name: 'Gajwel' }, { name: 'Jagdevpur' }, { name: 'Kondapak' }, { name: 'Mulug' },
                    { name: 'Markook' }, { name: 'Wargal' }, { name: 'Raipole' }
                ]
            },
            {
                name: 'Suryapet',
                mandals: [
                    { name: 'Suryapet' }, { name: 'Chivvemla' }, { name: 'Mothey' }, { name: 'Jajireddygudem' }, { name: 'Penpahad' },
                    { name: 'Atmakur (S)' }, { name: 'Nuthankal' }, { name: 'Maddirala' }, { name: 'Thungathurthy' }, { name: 'Nagaram' },
                    { name: 'Kodad' }, { name: 'Munagala' }, { name: 'Nadikuda' }, { name: 'Chilkur' }, { name: 'Huzurnagar' },
                    { name: 'Mattampally' }, { name: 'Mellachervu' }, { name: 'Garidepally' }, { name: 'Neredcherla' }, { name: 'Palakeedu' },
                    { name: 'Thirumalagiri' }
                ]
            },
            {
                name: 'Vikarabad',
                mandals: [
                    { name: 'Vikarabad' }, { name: 'Mompêt' }, { name: 'Pudur' }, { name: 'Dharur' }, { name: 'Bantwaram' },
                    { name: 'Kotepally' }, { name: 'Marpalle' }, { name: 'Tandur' }, { name: 'Peddemul' }, { name: 'Basheerabad' },
                    { name: 'Yelal' }, { name: 'Pargi' }, { name: 'Doma' }, { name: 'Kulkacherla' }, { name: 'Chowdapur' },
                    { name: 'Kodangal' }, { name: 'Bomraspet' }, { name: 'Doulthabad' }, { name: 'Nawabpet' }
                ]
            },
            {
                name: 'Wanaparthy',
                mandals: [
                    { name: 'Wanaparthy' }, { name: 'Gopalpet' }, { name: 'Rebbally' }, { name: 'Pebbair' }, { name: 'Peddamandadi' },
                    { name: 'Ghanpur' }, { name: 'Pangal' }, { name: 'Weepangandla' }, { name: 'Srirangapur' }, { name: 'Chinnambavi' },
                    { name: 'Kothakota' }, { name: 'Madanapur' }, { name: 'Atmakur' }, { name: 'Amarchinta' }
                ]
            },
            {
                name: 'Warangal',
                mandals: [
                    { name: 'Warangal' }, { name: 'Khila Warangal' }, { name: 'Geesugonda' }, { name: 'Sangem' }, { name: 'Parvathagiri' },
                    { name: 'Wardhannapet' }, { name: 'Rayaparthy' }, { name: 'Narsampet' }, { name: 'Chennaraopet' }, { name: 'Nallabelly' },
                    { name: 'Duggondi' }, { name: 'Khanapur' }, { name: 'Nekkonda' }
                ]
            },
            {
                name: 'Yadadri Bhuvanagiri',
                mandals: [
                    { name: 'Bhongir' }, { name: 'Bibinagar' }, { name: 'Bhoodan Pochampally' }, { name: 'Valigonda' }, { name: 'Ramannapet' },
                    { name: 'Choutuppal' }, { name: 'Narayanpur' }, { name: 'Mothkur' }, { name: 'Addagudur' }, { name: 'Atmakur (M)' },
                    { name: 'Alair' }, { name: 'Rajapet' }, { name: 'Turkapally' }, { name: 'Yadagirigutta' }, { name: 'Gundala' },
                    { name: 'Bommalaramaram' }
                ]
            }
        ]
    },
    {
        name: 'Andhra Pradesh',
        districts: [
            { name: 'Visakhapatnam', mandals: [{ name: 'Visakhapatnam Urban' }, { name: 'Visakhapatnam Rural' }, { name: 'Gajuwaka' }] },
            { name: 'Krishna', mandals: [{ name: 'Vijayawada Urban' }, { name: 'Vijayawada Rural' }, { name: 'Machilipatnam' }] },
            { name: 'Guntur', mandals: [{ name: 'Guntur East' }, { name: 'Guntur West' }, { name: 'Tenali' }] },
            { name: 'Chittoor', mandals: [{ name: 'Chittoor' }, { name: 'Tirupati Urban' }, { name: 'Tirupati Rural' }] },
            { name: 'East Godavari', mandals: [{ name: 'Kakinada Urban' }, { name: 'Kakinada Rural' }, { name: 'Rajahmundry Urban' }] },
            { name: 'West Godavari', mandals: [{ name: 'Eluru' }, { name: 'Bhimavaram' }, { name: 'Tadepalligudem' }] },
            { name: 'Nellore', mandals: [{ name: 'Nellore Urban' }, { name: 'Nellore Rural' }, { name: 'Kavali' }] },
            { name: 'Prakasam', mandals: [{ name: 'Ongole' }, { name: 'Chirala' }, { name: 'Markapur' }] },
            { name: 'Kadapa', mandals: [{ name: 'Kadapa' }, { name: 'Proddatur' }, { name: 'Pulivendula' }] },
            { name: 'Kurnool', mandals: [{ name: 'Kurnool Urban' }, { name: 'Kurnool Rural' }, { name: 'Nandyal' }] },
            { name: 'Anantapur', mandals: [{ name: 'Anantapur' }, { name: 'Dharmavaram' }, { name: 'Hindupur' }] },
            { name: 'Srikakulam', mandals: [{ name: 'Srikakulam' }, { name: 'Amadalavalasa' }, { name: 'Palasa' }] },
            { name: 'Vizianagaram', mandals: [{ name: 'Vizianagaram' }, { name: 'Parvathipuram' }, { name: 'Bobbili' }] }
        ]
    }
];
