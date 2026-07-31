import type { Category } from "@/lib/types";
import { products } from "@/lib/data/products";

const countByUniverse = (universe: string) =>
  products.filter((p) => p.universe === universe).length;

const countByProductCategory = (category: string) =>
  products.filter((p) => p.category === category).length;

export const categories: Category[] = [
  {
    id: "cat-pokemon",
    name: "Pokemon",
    slug: "pokemon",
    productCount: countByUniverse("Pokemon"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpkew5hWfJGDPv0nZngRTKvd2fsCsmM5lFgcgS-N5wJ-UsnrJVDD-vm84qdVs7AJM20uGy3YukInsU9iXFLj_iQtYUEl940UAX1K3Gd1PdWY4zZF1-UTABhqGTFToLKtlz0yJNhtye0Irn8mu-sDDTmVAE8yHG7D6DJKSptXS6pm-RMe5P8NAIRmRtnVNzaVMhxN-AP_tcCKV4Sd6-s9KjSCSThlRw_NY6zoUpi10TfOoEa-oh7OYaOshd82EqPnp6xzEgc0r8W2w",
    status: "active",
    description: "Tỉ lệ 1/12, 1/8. Bộ sưu tập mô hình và phụ kiện lấy cảm hứng từ vũ trụ Pokemon.",
    folderIds: ["folder-anime", "folder-the-bai"],
  },
  {
    id: "cat-gundam",
    name: "Gundam",
    slug: "gundam",
    productCount: countByUniverse("Gundam"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ8yLv7AzbBFRLHtXinZetvw-XaX2RvEu60KDlDpkjePZ8nqM32y4LwQ63Ie4wdIHdWE71IMSoa-Dx1zUi9bQ7awYpjMRR4MH7Wuyqg4e8FjK0f0BPFCQf_1AlAFqtRqQ1fm_9ODVtvLhRprpg91QvOh12uOwUxoPSjt2RhjSKCWt4gHAedi2y9Du1JU-fWChtOsLfgCwHhP0WjvR6lzTkpEB_TZ8LePWVpAi9zbXA8l2O9Qyr_dg5YaPbx10IeiZLBnDqjfVjcdQ",
    status: "active",
    description: "Chuyên gia Gunpla. Mô hình lắp ráp Gundam từ High Grade đến Perfect Grade.",
    folderIds: ["folder-gundam"],
  },
  {
    id: "cat-gundam-mg",
    name: "Master Grade (MG)",
    slug: "gundam-master-grade",
    productCount: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHolhb1tIqlwsIUDctO992GwoGKsooagRwfjLc1gWHZ0XkQuN4HzoUbWnmj1GCo4gbY1ghvc2wCMRY22QVGErig4MejQc-R40RBz7gEMbMXqHatoyhPdf5G9zpkUBHAi6QrsMaoIr1Olm2dhoPuKolUwlOo0A9zX-QrR2LY840oxWu9wyWxDdcaImlP38463yf04tGiENm0TKnmY6MZuIlvbpIqABTR7URR4VCGTcqxLnKWOwQ_b_I6gXWgdD26YHrOkBpIKdrkwE",
    status: "active",
    description: "Tỉ lệ 1/100, Mô hình chi tiết cao.",
    parentId: "cat-gundam",
    folderIds: ["folder-gundam"],
  },
  {
    id: "cat-gundam-pg",
    name: "Perfect Grade (PG)",
    slug: "gundam-perfect-grade",
    productCount: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHolhb1tIqlwsIUDctO992GwoGKsooagRwfjLc1gWHZ0XkQuN4HzoUbWnmj1GCo4gbY1ghvc2wCMRY22QVGErig4MejQc-R40RBz7gEMbMXqHatoyhPdf5G9zpkUBHAi6QrsMaoIr1Olm2dhoPuKolUwlOo0A9zX-QrR2LY840oxWu9wyWxDdcaImlP38463yf04tGiENm0TKnmY6MZuIlvbpIqABTR7URR4VCGTcqxLnKWOwQ_b_I6gXWgdD26YHrOkBpIKdrkwE",
    status: "active",
    description: "Tỉ lệ 1/60, Kỹ thuật đỉnh cao.",
    parentId: "cat-gundam",
    folderIds: ["folder-gundam"],
  },
  {
    id: "cat-naruto",
    name: "Naruto",
    slug: "naruto",
    productCount: countByUniverse("Naruto"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqPRRrN3HbtH7mNPTz7Zy503W_xaBMApt52BReVXtfPrwZCMht65nZYGLbmGMXnDnahixO86TpjqZX6fXfXvaeQ2cfAy_Qt52OdJTlHncl1Top6iKkN44XJMAhvpCEZcth_idwjLNZU5XkkWzULuiDRmNSxlY5acJiXD-syZPg0FjLlXrl8NickcLVVwRTYJFmvXEvKZbsOJfagWKQpFILffofWh5cmbO5i9MhhwrQXvW6YhEOggM1d30ylR9Dv0ZwANmjic_wBfk",
    status: "active",
    description: "Mô hình PVC. Bộ sưu tập nhân vật từ series Naruto và Naruto Shippuden.",
    folderIds: ["folder-anime", "folder-the-bai"],
  },
  {
    id: "cat-one-piece",
    name: "One Piece",
    slug: "one-piece",
    productCount: countByUniverse("One Piece"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCX9IUsJCnRnSzYGPoS-pOa-spJ_mdjy0GTa3WRRt9mmmeo4ZSeW7iYdjJ1GRlvDBSshhpaYoDqang3PMTklz773eoMySj5Pl0cYvI98ePW4M4HShfUdcGXs_dtiS7srwJRm1waywaFuB6Qlo1S3eA8KGZi8gNbNJYynsDqt0_FgKmjWQsPeTJ2PFoFOrQBUMPeCp95WwUixNfWtaIb305fjbJtkDR5hzFVAPoQN45eNpPinLwzHHfz4IqZQkla5de9WtZv9Q09_w",
    status: "active",
    description: "Tượng Resin. Mô hình các thuyền viên băng Mũ Rơm và đồng minh.",
    folderIds: ["folder-anime"],
  },
  {
    id: "cat-nendoroids",
    name: "Nendoroids",
    slug: "nendoroids",
    productCount: countByProductCategory("Nendoroids"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAe-ievR1rg9kiDJzx1IXahayXhVMraBa-RmpV-FbC-dAWgU9f7kD3njihmHjTf2tqQQDnGBwxFiYLRxHPqxmjERJMF6qq0rKVHp6RvTqDxo-1KU-bO3ab38wJG4zOsWSXEWhF5yGxmSCoe0diWxHvza5IfVz765vG2OWnq1KM6X8h6O7FD6MOg3qRxvcV-h2ed4Xb8cQZ6umVgGZwOdkRcGsUOcZpKo9Mr_oHap2_RbekqlaRU0_sxVS6zUe4fb_oDDPh9sKu-KfI",
    status: "active",
    description: "Mô hình chibi Q-version với khớp cử động và phụ kiện thay thế.",
    folderIds: ["folder-khac"],
  },
  {
    id: "cat-mo-hinh-scale",
    name: "Mô hình Scale",
    slug: "mo-hinh-scale",
    productCount: countByProductCategory("Mô hình Scale"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVKBai5DBjJuQHAwW_T-1uy18T496g2bx0xehyq7FsOKkhWsfep_xPaMdVGchjeiFu7BPrBrAgYOEb2_YZ2NVyYxk3qAK-SZcewkMJyC7GqKPu9fF-2F3a-kM44cuul3bfq7lpqJdCv0vtPDHPsqZufOOIRcHO7S8uwLpresawm0q2sMEGSCnWlccqPS5XvS8pSDJzpTfVDuonop3R5sohVnyqxDpMTEPHgEb79VfEVk8uKwQt-ngT31boVO_5Rey1GM2nNRReRfI",
    status: "active",
    description: "Tượng tỉ lệ chi tiết cao (1/7, 1/8) dành cho nhà sưu tầm.",
    folderIds: ["folder-khac"],
  },
  {
    id: "cat-pokemon-gems",
    name: "Pokemon Gems",
    slug: "pokemon-gems",
    productCount: countByProductCategory("Pokemon Gems"),
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEZmv4kP0Tl7a5hj3Yo83WHqM2dm-bXHlc7YD1EOPKDxDGyD5M8K8vBkMpf7EPim1s183Y4-yUrIbRpU8O_2gHd9WFzb7-9fXIkxz28xCdPv3xsB-nGpspYDysrFk9I2gdva6Yss6o4NmUVfzX3-Ua723w37mTaiQSgR_L_zwXTCMMNlJLTXgagTsHkqUH_wC6SnJifyydcVtADMrusU9zWXz4Froq7KrA5PyZOXEcgkThtL7Scv7QynP9JxZn9SVd5EolZ9EQjqo",
    status: "active",
    description: "Dòng G.E.M. Series và mô hình tỉ lệ cao cấp lấy cảm hứng từ Pokemon.",
    folderIds: ["folder-the-bai"],
  },
];
