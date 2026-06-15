function Category(props) {

  const {
    category,
    setCategory,
  } = props;

  const menuList = [
    "전체",
    "카페",
    "학식당",
    "편의점",
    "서점",
    "기숙사",
    "PC실습실",
    "은행",
    "생활편의",
    "도서관",
    "프린트",
  ];

  return (

    <div className="categoryBox">

      {menuList.map((item) => (

        <button

          key={item}

          className={

            category === item

              ? "category activeCategory"

              : "category"
          }

          onClick={() => {

            // 같은 카테고리 다시 누르면 해제
            if (category === item) {

              setCategory("전체");

            } else {

              setCategory(item);
            }
          }}
        >

          {item}

        </button>

      ))}

    </div>
  );
}

export default Category;