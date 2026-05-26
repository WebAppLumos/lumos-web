function Category(props) {

  const {
    category,
    setCategory,
  } = props;

  const menuList = [
    "전체",
    "카페",
    "도서관",
    "프린트",
    "학식당",
    "편의점",
    "서점",
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

          onClick={() =>
            setCategory(item)
          }
        >

          {item}

        </button>

      ))}

    </div>
  );
}

export default Category;